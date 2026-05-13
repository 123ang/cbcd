from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

Position = List[int]

class Weights(BaseModel):
    alpha: float = 1
    beta: float = 3
    gamma: float = 5
    delta: float = 10
    epsilon: float = 2

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
    explanation: Optional[str] = None
