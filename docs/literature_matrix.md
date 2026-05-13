# Literature Matrix — Phase 1 Seed

| Theme | Source from proposal | How it supports Phase 1 |
|---|---|---|
| Design Science Research Methodology | Peffers et al. (2007) | Justifies building and evaluating a technological artifact through design, demonstration, and evaluation stages. |
| Dynamic risk and congestion routing | Kim (2026) | Supports evaluating routes under changing risk/congestion rather than distance only. |
| Evacuation route planning in buildings | Dynamic Evacuation Route Planning in Complex Buildings (2025) | Supports the confined-building scenario framing and multi-scenario evaluation design. |
| Q-learning / deep RL path planning | Bhattarai et al. (2021) | Supports using Q-learning/RL as an intelligent route-planning comparison method. |
| Human-risk-aware safe path planning | Long et al. (2025) | Supports adding human/crowd/risk-aware cost into route selection. |
| Multi-agent RL for escape planning | Fitkau (2025) | Supports future-work discussion beyond the current single-agent grid prototype. |
| YOLO people detection | Alano (2024); Shyaa (2024) | Reserved for Phase 2; supports camera-based crowd detection and people counting. |

## Phase 1 implication

The implementation should be evaluated as a decision-support artifact: Dijkstra and A* provide shortest-path baselines, Weighted A* represents the explicit risk-cost model, and Q-learning provides a learning-based comparison route.
