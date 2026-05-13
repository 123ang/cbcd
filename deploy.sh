#!/usr/bin/env bash
# Update repo and redeploy CBCD on the VPS (see DEPLOY_VPS.md).
#
# Usage (as root on the server):
#   ./deploy.sh
#
# Env overrides:
#   CBCD_ROOT=/root/projects/cbcd   # project root on disk
#   SKIP_GIT=1                      # skip git pull (e.g. after rsync upload)
#   GIT_BRANCH=main                 # checkout/pull this branch before pull

set -euo pipefail

CBCD_ROOT="${CBCD_ROOT:-/root/projects/cbcd}"
BACKEND_DIR="${CBCD_ROOT}/backend"
FRONTEND_DIR="${CBCD_ROOT}/frontend"
VENV_PYTHON="${BACKEND_DIR}/.venv/bin/python"
VENV_PIP="${BACKEND_DIR}/.venv/bin/pip"
SERVICE="${CBCD_SERVICE:-cbcd-api}"

log() {
  printf '%s\n' "$*"
}

die() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

[[ -d "$CBCD_ROOT" ]] || die "CBCD_ROOT not found: $CBCD_ROOT"

cd "$CBCD_ROOT"

if [[ "${SKIP_GIT:-0}" != "1" ]]; then
  [[ -d "$CBCD_ROOT/.git" ]] || die "No .git in $CBCD_ROOT (set SKIP_GIT=1 after rsync, or clone the repo)"

  git fetch origin
  branch="${GIT_BRANCH:-}"
  if [[ -n "${branch}" ]]; then
    git checkout "$branch"
  fi
  git pull --ff-only
fi

[[ -x "$VENV_PYTHON" ]] || die "Backend venv missing: $BACKEND_DIR/.venv — run DEPLOY_VPS.md backend setup once"

log "== Backend: pip install =="
"$VENV_PIP" install --upgrade pip
"$VENV_PIP" install -r "${BACKEND_DIR}/requirements.txt"

log "== Backend: restart ${SERVICE} =="
if systemctl is-enabled "${SERVICE}" &>/dev/null || systemctl is-active "${SERVICE}" &>/dev/null; then
  systemctl restart "${SERVICE}"
  systemctl is-active "${SERVICE}" --quiet || die "${SERVICE} failed to stay active — check: journalctl -u ${SERVICE} -n 50"
else
  log "WARN: systemd unit '${SERVICE}' not active/enabled — start manually (see DEPLOY_VPS.md)."
fi

[[ -f "${FRONTEND_DIR}/package-lock.json" ]] || die "Missing ${FRONTEND_DIR}/package-lock.json"

if [[ ! -f "${FRONTEND_DIR}/.env.production" ]]; then
  log "== Frontend: creating .env.production (VITE_API_BASE=/api) =="
  printf '%s\n' 'VITE_API_BASE=/api' > "${FRONTEND_DIR}/.env.production"
fi

log "== Frontend: npm ci + build =="
(
  cd "$FRONTEND_DIR"
  npm ci --no-audit --no-fund
  npm run build
)

[[ -f "${FRONTEND_DIR}/dist/index.html" ]] || die "Build output missing: ${FRONTEND_DIR}/dist/index.html"

if command -v nginx >/dev/null 2>&1; then
  if nginx -t 2>/dev/null; then
    log "== Nginx: reload =="
    systemctl reload nginx
  else
    log "WARN: nginx -t failed — not reloading (fix config first)."
    nginx -t || true
  fi
fi

log "Done. Sanity check:"
log "  curl -sS http://127.0.0.1:4017/health || true"
log "  curl -sS \"http://cbcd.suntzutechnologies.com:3017/api/health\" || true"
