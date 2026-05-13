from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

Position = List[int]

class Weights(BaseModel):
    # Cost-model coefficients. Keep alpha as distance weight only.
    alpha: float = 1
    beta: float = 3
    gamma: float = 5
    delta: float = 10
    # Kept for thesis terminology; reported as path-level exit access, not added per step.
    epsilon: float = 2
    # Weighted A* heuristic inflation; separate from cost-model alpha.
    heuristic_weight: float = 1

class ScenarioRequest(BaseModel):
    name: str = "Untitled scenario"
    grid: List[List[Dict[str, Any]]]
    start: Position
    exits: List[Position]
    weights: Weights = Field(default_factory=Weights)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RouteResult(BaseModel):
    algorithm: str
    success: bool
    path: List[Position]
    distance: int
    risk_score: float
    crowd_score: float
    total_cost: float
    time_ms: float
    nodes_expanded: int
    weights: Weights
    reached_exit: Optional[Position] = None
    train_steps: Optional[int] = None
    exit_access_score: Optional[float] = None
    explanation: Optional[str] = None
