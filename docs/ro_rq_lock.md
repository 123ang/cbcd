# Locked Research Objectives and Questions

The proposal uses six aligned objectives/questions. Phase 1 directly implements RO1–RO3 and prepares evaluation evidence for RO6. Phase 2 will implement RO4–RO5 later.

| RO | Locked objective summary | RQ summary | Phase status |
|---|---|---|---|
| RO1 | Identify spatial/environmental risk factors: distance, obstacles, risk zones, crowd density, exit accessibility. | What factors should be considered? | Phase 1 documented in risk factor table. |
| RO2 | Develop a simulation-based 2D risk-aware navigation model. | How can the model integrate those factors? | Implemented through grid + weighted cost model. |
| RO3 | Compare Dijkstra, A*, Weighted A*, and Q-learning. | How does the proposed model perform against baselines/RL? | Implemented through API, dashboard, and experiment harness. |
| RO4 | Develop YOLO camera-based crowd detection. | How can YOLO detect/count people? | Phase 2 parked. |
| RO5 | Convert detected crowd levels into crowd-risk scores. | How can crowd levels update the navigation model? | Phase 2 parked; Phase 1 supports simulated crowd cells. |
| RO6 | Evaluate the full system using scenarios and metrics. | How effective is the system vs distance-based routing? | Phase 1 experiment harness implemented; full evaluation continues after Phase 2. |
