import math
import os
import secrets
import threading
import time
from typing import Optional

from fastapi import Header, HTTPException, Request


class FixedWindowRateLimiter:
    def __init__(self):
        self._buckets = {}
        self._lock = threading.Lock()

    def clear(self):
        with self._lock:
            self._buckets.clear()

    def check(self, key: str, limit: int, window_seconds: int = 60) -> int:
        now = time.monotonic()
        with self._lock:
            count, reset_at = self._buckets.get(key, (0, now + window_seconds))
            if now >= reset_at:
                count, reset_at = 0, now + window_seconds
            if count >= limit:
                return max(1, math.ceil(reset_at - now))
            self._buckets[key] = (count + 1, reset_at)

            if len(self._buckets) > 10_000:
                self._buckets = {
                    bucket_key: value
                    for bucket_key, value in self._buckets.items()
                    if value[1] > now
                }
        return 0


rate_limiter = FixedWindowRateLimiter()


def _positive_int_env(name: str, default: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError:
        return default
    return value if value > 0 else default


def _client_identifier(request: Request) -> str:
    peer = request.client.host if request.client else "unknown"
    trusted_proxies = {
        value.strip()
        for value in os.getenv("CBCD_TRUSTED_PROXY_IPS", "127.0.0.1,::1").split(",")
        if value.strip()
    }
    if peer in trusted_proxies:
        real_ip = request.headers.get("x-real-ip", "").strip()
        if real_ip:
            return real_ip
        forwarded = [
            value.strip()
            for value in request.headers.get("x-forwarded-for", "").split(",")
            if value.strip()
        ]
        if forwarded:
            return forwarded[-1]
    return peer


def make_rate_limit_guard(bucket: str, env_name: str, default_limit: int):
    async def guard(request: Request):
        limit = _positive_int_env(env_name, default_limit)
        client = _client_identifier(request)
        retry_after = rate_limiter.check(f"{bucket}:{client}", limit)
        if retry_after:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again shortly.",
                headers={"Retry-After": str(retry_after)},
            )

    return guard


async def require_operator_api_key(
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
):
    configured_key = os.getenv("CBCD_API_KEY", "").strip()
    if not configured_key:
        raise HTTPException(
            status_code=503,
            detail="Server writes are disabled until CBCD_API_KEY is configured.",
        )
    if not x_api_key or not secrets.compare_digest(x_api_key, configured_key):
        raise HTTPException(status_code=401, detail="A valid operator API key is required.")


compute_rate_limit = make_rate_limit_guard(
    "compute",
    "CBCD_COMPUTE_RATE_LIMIT",
    30,
)
upload_rate_limit = make_rate_limit_guard(
    "upload",
    "CBCD_UPLOAD_RATE_LIMIT",
    6,
)
write_rate_limit = make_rate_limit_guard(
    "write",
    "CBCD_WRITE_RATE_LIMIT",
    10,
)
