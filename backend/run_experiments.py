import csv
import json
from datetime import datetime, timezone
from pathlib import Path

from algorithms.pathfinding import astar, dijkstra, qlearning, weighted_astar
from utils.models import ScenarioRequest

ROOT = Path(__file__).parent
SCENARIOS = ROOT / "data" / "scenarios.json"
OUT = ROOT / "data" / "experiment_logs.csv"
PRESETS = {
    "Default": {"alpha": 1, "beta": 3, "gamma": 5, "delta": 10, "epsilon": 2, "heuristic_weight": 1},
    "Distance-heavy": {"alpha": 3, "beta": 1, "gamma": 2, "delta": 10, "epsilon": 1, "heuristic_weight": 1},
    "Safety-heavy": {"alpha": 1, "beta": 5, "gamma": 8, "delta": 12, "epsilon": 2, "heuristic_weight": 1},
}
ALGORITHMS = [dijkstra, astar, weighted_astar, qlearning]
FIELDS = [
    "timestamp", "scenario", "preset", "algorithm", "success", "distance", "risk_score",
    "crowd_score", "total_cost", "time_ms", "nodes_expanded", "train_steps", "reached_exit", "exit_access_score",
    "delta_distance_vs_dijkstra", "delta_risk_vs_dijkstra", "risk_reduction_pct", "crowd_reduction_pct",
    "alpha", "beta", "gamma", "delta", "epsilon", "heuristic_weight"
]

def reduction_pct(baseline, value):
    if baseline == 0:
        return 0.0 if value == 0 else None
    return round(((baseline - value) / baseline) * 100, 2)


def main():
    scenarios = json.loads(SCENARIOS.read_text())
    rows = []
    for scenario in scenarios:
        for preset, weights in PRESETS.items():
            req_data = dict(scenario)
            req_data["weights"] = weights
            req = ScenarioRequest(**req_data)
            results = [algo(req).model_dump() for algo in ALGORITHMS]
            baseline = next(result for result in results if result["algorithm"] == "dijkstra")
            for result in results:
                rows.append({
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "scenario": scenario["name"],
                    "preset": preset,
                    "algorithm": result["algorithm"],
                    "success": result["success"],
                    "distance": result["distance"],
                    "risk_score": result["risk_score"],
                    "crowd_score": result["crowd_score"],
                    "total_cost": result["total_cost"],
                    "time_ms": result["time_ms"],
                    "nodes_expanded": result["nodes_expanded"],
                    "train_steps": result.get("train_steps"),
                    "reached_exit": result.get("reached_exit"),
                    "exit_access_score": result.get("exit_access_score"),
                    "delta_distance_vs_dijkstra": round(result["distance"] - baseline["distance"], 3),
                    "delta_risk_vs_dijkstra": round(result["risk_score"] - baseline["risk_score"], 3),
                    "risk_reduction_pct": reduction_pct(baseline["risk_score"], result["risk_score"]),
                    "crowd_reduction_pct": reduction_pct(baseline["crowd_score"], result["crowd_score"]),
                    **weights,
                })
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {OUT}")


if __name__ == "__main__":
    main()
