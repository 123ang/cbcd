import csv
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from algorithms.pathfinding import astar, dijkstra, qlearning, weighted_astar
from utils.crowd_detector import MAX_UPLOAD_BYTES, analyze_media_upload
from utils.models import CompareSelectedRequest, RouteResult, ScenarioRequest
from utils.request_security import (
    compute_rate_limit,
    rate_limiter,
    require_operator_api_key,
    upload_rate_limit,
    write_rate_limit,
)

app = FastAPI(title="CBCD Phase 1 Risk-Aware Navigation API")
app.state.rate_limiter = rate_limiter


def _allowed_origins():
    configured = os.getenv(
        "CBCD_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://cbcd.suntzutechnologies.com",
    )
    return [
        origin.strip()
        for origin in configured.split(",")
        if origin.strip() and origin.strip() != "*"
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)
DATA_DIR = Path(__file__).parent / "data"
SCENARIOS = DATA_DIR / "scenarios.json"
EXPERIMENT_LOG = DATA_DIR / "experiment_logs.csv"
ALGORITHMS = {
    "dijkstra": dijkstra,
    "astar": astar,
    "weighted_astar": weighted_astar,
    "qlearning": qlearning,
}

def _reduction_pct(baseline: float, value: float):
    if baseline == 0:
        return 0.0 if value == 0 else None
    return round(((baseline - value) / baseline) * 100, 2)

def _with_dijkstra_deltas(results: List[RouteResult], baseline: RouteResult):
    for result in results:
        result.delta_distance_vs_dijkstra = round(result.distance - baseline.distance, 3)
        result.delta_risk_vs_dijkstra = round(result.risk_score - baseline.risk_score, 3)
        result.risk_reduction_pct = _reduction_pct(baseline.risk_score, result.risk_score)
        result.crowd_reduction_pct = _reduction_pct(baseline.crowd_score, result.crowd_score)
    return results

@app.get("/health")
def health():
    return {"ok": True, "phase": "phase_1"}

@app.post(
    "/run-dijkstra",
    response_model=RouteResult,
    dependencies=[Depends(compute_rate_limit)],
)
def run_dijkstra(req: ScenarioRequest):
    return dijkstra(req)

@app.post(
    "/run-astar",
    response_model=RouteResult,
    dependencies=[Depends(compute_rate_limit)],
)
def run_astar(req: ScenarioRequest):
    return astar(req)

@app.post(
    "/run-weighted-astar",
    response_model=RouteResult,
    dependencies=[Depends(compute_rate_limit)],
)
def run_weighted_astar(req: ScenarioRequest):
    return weighted_astar(req)

def _validate_qlearning_budget(req: ScenarioRequest):
    try:
        max_cells = int(os.getenv("CBCD_MAX_QLEARNING_CELLS", "2500"))
    except ValueError:
        max_cells = 2500
    max_cells = max(max_cells, 1)
    cells = len(req.grid) * len(req.grid[0])
    if cells > max_cells:
        raise HTTPException(
            status_code=422,
            detail=f"Q-learning is limited to {max_cells} grid cells; received {cells}.",
        )


@app.post(
    "/run-qlearning",
    response_model=RouteResult,
    dependencies=[Depends(compute_rate_limit)],
)
def run_qlearning(req: ScenarioRequest):
    _validate_qlearning_budget(req)
    return qlearning(req)

@app.post(
    "/compare-algorithms",
    response_model=List[RouteResult],
    dependencies=[Depends(compute_rate_limit)],
)
def compare_algorithms(req: ScenarioRequest):
    _validate_qlearning_budget(req)
    results = [fn(req) for fn in ALGORITHMS.values()]
    baseline = next((result for result in results if result.algorithm == "dijkstra"), results[0])
    return _with_dijkstra_deltas(results, baseline)

@app.post(
    "/compare-selected",
    response_model=List[RouteResult],
    dependencies=[Depends(compute_rate_limit)],
)
def compare_selected(payload: CompareSelectedRequest):
    req = payload.scenario
    selected = payload.algorithms
    if "qlearning" in selected:
        _validate_qlearning_budget(req)
    results = [ALGORITHMS[name](req) for name in selected]
    baseline = next((result for result in results if result.algorithm == "dijkstra"), None) or dijkstra(req)
    return _with_dijkstra_deltas(results, baseline)

@app.get("/load-scenario")
def load_scenarios():
    if not SCENARIOS.exists():
        return []
    return json.loads(SCENARIOS.read_text())

@app.post(
    "/save-scenario",
    dependencies=[Depends(write_rate_limit), Depends(require_operator_api_key)],
)
def save_scenario(req: ScenarioRequest):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    scenarios = json.loads(SCENARIOS.read_text()) if SCENARIOS.exists() else []
    scenarios = [s for s in scenarios if s.get("name") != req.name]
    scenarios.append(req.model_dump())
    SCENARIOS.write_text(json.dumps(scenarios, indent=2))
    return {"saved": True, "count": len(scenarios)}

@app.post(
    "/export-results",
    dependencies=[Depends(write_rate_limit), Depends(require_operator_api_key)],
)
def export_results(payload: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    rows = payload.get("results", [])
    scenario_name = payload.get("scenario_name", "Untitled")
    fieldnames = [
        "timestamp", "scenario", "algorithm", "success", "distance", "risk_score",
        "crowd_score", "total_cost", "time_ms", "nodes_expanded", "train_steps",
        "reached_exit", "exit_access_score",
        "delta_distance_vs_dijkstra", "delta_risk_vs_dijkstra",
        "risk_reduction_pct", "crowd_reduction_pct",
        "alpha", "beta", "gamma", "delta", "epsilon", "heuristic_weight"
    ]
    exists = EXPERIMENT_LOG.exists()
    with EXPERIMENT_LOG.open("a", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        if not exists:
            writer.writeheader()
        for row in rows:
            weights = row.get("weights", {})
            writer.writerow({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "scenario": scenario_name,
                "algorithm": row.get("algorithm"),
                "success": row.get("success"),
                "distance": row.get("distance"),
                "risk_score": row.get("risk_score"),
                "crowd_score": row.get("crowd_score"),
                "total_cost": row.get("total_cost"),
                "time_ms": row.get("time_ms"),
                "nodes_expanded": row.get("nodes_expanded"),
                "train_steps": row.get("train_steps"),
                "reached_exit": row.get("reached_exit"),
                "exit_access_score": row.get("exit_access_score"),
                "delta_distance_vs_dijkstra": row.get("delta_distance_vs_dijkstra"),
                "delta_risk_vs_dijkstra": row.get("delta_risk_vs_dijkstra"),
                "risk_reduction_pct": row.get("risk_reduction_pct"),
                "crowd_reduction_pct": row.get("crowd_reduction_pct"),
                "alpha": weights.get("alpha"),
                "beta": weights.get("beta"),
                "gamma": weights.get("gamma"),
                "delta": weights.get("delta"),
                "epsilon": weights.get("epsilon"),
                "heuristic_weight": weights.get("heuristic_weight", 1),
            })
    return {"saved": True, "path": str(EXPERIMENT_LOG), "rows": len(rows)}

async def _read_upload_limited(media: UploadFile):
    if media.size is not None and media.size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Upload is larger than the 50 MB prototype limit.",
        )

    chunks = []
    total = 0
    while chunk := await media.read(1024 * 1024):
        total += len(chunk)
        if total > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Upload is larger than the 50 MB prototype limit.",
            )
        chunks.append(chunk)
    return b"".join(chunks)


@app.post("/camera/crowd", dependencies=[Depends(upload_rate_limit)])
async def camera_crowd(media: UploadFile = File(...)):
    raw = await _read_upload_limited(media)
    try:
        result = analyze_media_upload(raw, media.filename or "upload", media.content_type or "")
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    result["file_name"] = media.filename
    result["content_type"] = media.content_type
    return result
