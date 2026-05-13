import json
from pathlib import Path

from algorithms.pathfinding import astar, dijkstra, qlearning, weighted_astar
from utils.models import ScenarioRequest

scenarios = json.loads((Path(__file__).parent / "data" / "scenarios.json").read_text())
req = ScenarioRequest(**scenarios[1])
results = [fn(req) for fn in (dijkstra, astar, weighted_astar, qlearning)]
for result in results:
    assert result.success, f"{result.algorithm} failed on S2"
    print(result.algorithm, result.distance, result.risk_score, result.crowd_score, result.total_cost, result.time_ms)
assert weighted_astar(req).risk_score <= dijkstra(req).risk_score, "Weighted A* should reduce risk on S2"
print("backend smoke test passed")
