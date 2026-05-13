import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from algorithms.pathfinding import astar, dijkstra, qlearning, weighted_astar
from utils.models import RouteResult, ScenarioRequest

app = FastAPI(title="CBCD Phase 1 Risk-Aware Navigation API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.get("/health")
def health():
    return {"ok": True, "phase": "phase_1"}

@app.post("/run-dijkstra", response_model=RouteResult)
def run_dijkstra(req: ScenarioRequest):
    return dijkstra(req)

@app.post("/run-astar", response_model=RouteResult)
def run_astar(req: ScenarioRequest):
    return astar(req)

@app.post("/run-weighted-astar", response_model=RouteResult)
def run_weighted_astar(req: ScenarioRequest):
    return weighted_astar(req)

@app.post("/run-qlearning", response_model=RouteResult)
def run_qlearning(req: ScenarioRequest):
    return qlearning(req)

@app.post("/compare-algorithms", response_model=List[RouteResult])
def compare_algorithms(req: ScenarioRequest):
    return [fn(req) for fn in ALGORITHMS.values()]

@app.post("/compare-selected", response_model=List[RouteResult])
def compare_selected(payload: dict):
    req = ScenarioRequest(**payload["scenario"])
    selected = payload.get("algorithms") or list(ALGORITHMS)
    return [ALGORITHMS[name](req) for name in selected if name in ALGORITHMS]

@app.get("/load-scenario")
def load_scenarios():
    if not SCENARIOS.exists():
        return []
    return json.loads(SCENARIOS.read_text())

@app.post("/save-scenario")
def save_scenario(req: ScenarioRequest):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    scenarios = json.loads(SCENARIOS.read_text()) if SCENARIOS.exists() else []
    scenarios = [s for s in scenarios if s.get("name") != req.name]
    scenarios.append(req.model_dump())
    SCENARIOS.write_text(json.dumps(scenarios, indent=2))
    return {"saved": True, "count": len(scenarios)}

@app.post("/export-results")
def export_results(payload: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    rows = payload.get("results", [])
    scenario_name = payload.get("scenario_name", "Untitled")
    fieldnames = [
        "timestamp", "scenario", "algorithm", "success", "distance", "risk_score",
        "crowd_score", "total_cost", "time_ms", "nodes_expanded", "train_steps",
        "reached_exit", "exit_access_score",
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
                "alpha": weights.get("alpha"),
                "beta": weights.get("beta"),
                "gamma": weights.get("gamma"),
                "delta": weights.get("delta"),
                "epsilon": weights.get("epsilon"),
                "heuristic_weight": weights.get("heuristic_weight", 1),
            })
    return {"saved": True, "path": str(EXPERIMENT_LOG), "rows": len(rows)}

@app.post("/camera/crowd")
def camera_crowd_stub():
    return {"phase": "Phase 2 stub", "message": "YOLO crowd detection is intentionally parked until Phase 1 is complete."}
