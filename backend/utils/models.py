from typing import Annotated, Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, StrictInt, model_validator

MAX_GRID_ROWS = 80
MAX_GRID_COLS = 80
Position = Annotated[List[StrictInt], Field(min_length=2, max_length=2)]
GridRow = Annotated[List[Dict[str, Any]], Field(min_length=1, max_length=MAX_GRID_COLS)]
AlgorithmName = Literal["dijkstra", "astar", "weighted_astar", "qlearning"]

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
    grid: Annotated[List[GridRow], Field(min_length=1, max_length=MAX_GRID_ROWS)]
    start: Position
    exits: Annotated[List[Position], Field(min_length=1, max_length=MAX_GRID_ROWS * MAX_GRID_COLS)]
    weights: Weights = Field(default_factory=Weights)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_grid_and_route_points(self):
        columns = len(self.grid[0])
        if any(len(row) != columns for row in self.grid):
            raise ValueError("Grid rows must all have the same number of columns.")

        rows = len(self.grid)

        def validate_position(position, label):
            row, column = position
            if not (0 <= row < rows and 0 <= column < columns):
                raise ValueError(f"{label} must be inside the grid.")
            if self.grid[row][column].get("type", "empty") in {"wall", "blocked"}:
                raise ValueError(f"{label} must be on a passable cell.")

        validate_position(self.start, "Start")
        for index, exit_position in enumerate(self.exits, start=1):
            validate_position(exit_position, f"Exit {index}")
        return self


class CompareSelectedRequest(BaseModel):
    scenario: ScenarioRequest
    algorithms: Annotated[
        List[AlgorithmName],
        Field(
            default_factory=lambda: ["dijkstra", "astar", "weighted_astar", "qlearning"],
            min_length=1,
            max_length=4,
        ),
    ]


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
    delta_distance_vs_dijkstra: Optional[float] = None
    delta_risk_vs_dijkstra: Optional[float] = None
    risk_reduction_pct: Optional[float] = None
    crowd_reduction_pct: Optional[float] = None
    explanation: Optional[str] = None
