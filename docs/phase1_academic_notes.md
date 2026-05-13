# Phase 1 Academic Notes

## Research aim

This research develops and evaluates a simulation-based risk-aware indoor navigation decision-support prototype for confined environments. The Phase 1 prototype compares traditional shortest-path routing with risk-aware routing by integrating distance, obstacles, risk zones, crowd density, and exit accessibility into a weighted route-cost model. The objective is to demonstrate that the shortest route is not always the safest route, and that safer route recommendations can be made explainable through measurable route metrics.

## DSRM alignment

| DSRM stage | Phase 1 implementation evidence |
|---|---|
| Problem identification | Shortest-path navigation may route users through crowded, risky, or blocked areas. |
| Define objectives | Recommend safer routes using measurable spatial and environmental risk factors. |
| Design and development | React dashboard + FastAPI algorithm engine with Dijkstra, A*, Weighted A*, and Q-learning. |
| Demonstration | Built-in S1–S6 scenarios show normal routing, risk detour, crowd detour, blocked exit, dynamic-risk setup, and comparison sweep. |
| Evaluation | `backend/run_experiments.py` runs S1–S6 × three weight presets and writes `experiment_logs.csv`. |
| Communication | Dashboard comparison table, route overlays, recommendation panel, and this documentation support thesis Chapter 4/5 write-up. |

## Scope and limitations

- The prototype is a decision-support and research demonstration system, not a certified evacuation system.
- The grid map is a simplified 2D representation of indoor space.
- Phase 1 uses manually/simulated crowd and risk cells; camera-based crowd detection is parked for Phase 2.
- Q-learning is implemented for grid-based comparison and demonstrability, not as a production-grade multi-agent evacuation model.
- Route safety is evaluated through modeled risk/crowd exposure and total cost, not real-world evacuation trials.
