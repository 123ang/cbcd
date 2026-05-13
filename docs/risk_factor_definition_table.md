# Risk Factor Definition Table — Phase 1

| Factor | Definition | Measurement in prototype | Cell / model mapping |
|---|---|---|---|
| Distance | Travel effort from start to exit. | Number of grid steps along path. | `alpha × step cost`; supported by shortest-path baselines such as Dijkstra/A*. |
| Obstacles / blockage | Non-traversable or temporarily unavailable areas. | Wall/blocked cells cannot be traversed. | `wall`, `blocked`; blockage penalty represented in model and passability rules |
| Risk zones | Hazardous areas that should be avoided when possible. | Sum of risk-cell intensity values on route. | `risk` cells with intensity 1–3; `gamma × risk`; supported by dynamic risk/congestion evacuation literature. |
| Crowd density | Congested areas that increase movement risk/delay. | Sum of crowd-cell intensity values on route. | `crowd` cells with intensity 1–3; `beta × crowd`; Phase 2 will connect this to YOLO crowd-counting literature. |
| Exit accessibility | Preference for cells/routes with better access to exits. | Normalized Manhattan distance to nearest exit. | `epsilon × exit_access` |

## Cost model

```text
cell_cost = α·distance + β·crowd + γ·risk + δ·blockage + ε·exit_access
```

Default weights used by the prototype:

```text
α = 1, β = 3, γ = 5, δ = 10, ε = 2
```
