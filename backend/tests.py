import json
from pathlib import Path

from algorithms.pathfinding import astar, dijkstra, qlearning, weighted_astar
from utils.models import ScenarioRequest

SCENARIOS = json.loads((Path(__file__).parent / "data" / "scenarios.json").read_text())


def run_all_on_scenarios():
    for scenario in SCENARIOS:
        req = ScenarioRequest(**scenario)
        for fn in (dijkstra, astar, weighted_astar, qlearning):
            result = fn(req)
            assert result.success, f"{result.algorithm} failed on {scenario['name']}"
            assert result.path[0] == req.start, f"{result.algorithm} bad start on {scenario['name']}"
            assert result.path[-1] in req.exits, f"{result.algorithm} bad exit on {scenario['name']}"
            assert result.distance == max(len(result.path) - 1, 0)


def run_risk_detour_assertion():
    req = ScenarioRequest(**SCENARIOS[1])
    baseline = dijkstra(req)
    proposed = weighted_astar(req)
    learned = qlearning(req)
    assert proposed.risk_score <= baseline.risk_score
    assert learned.risk_score <= baseline.risk_score


if __name__ == "__main__":
    run_all_on_scenarios()
    run_risk_detour_assertion()
    print("all backend tests passed")
