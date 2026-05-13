from math import inf

BLOCKING_TYPES = {"wall", "blocked"}


def cell_at(grid, pos):
    r, c = pos
    return grid[r][c]


def cell_type(cell):
    return cell.get("type", "empty")


def intensity(cell):
    try:
        return float(cell.get("intensity", 1) or 1)
    except (TypeError, ValueError):
        return 1.0


def in_bounds(grid, r, c):
    return 0 <= r < len(grid) and 0 <= c < len(grid[0])


def passable(grid, r, c):
    return cell_type(grid[r][c]) not in BLOCKING_TYPES


def neighbors(grid, pos):
    r, c = pos
    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
        if in_bounds(grid, nr, nc) and passable(grid, nr, nc):
            yield [nr, nc]


def manhattan_to_nearest_exit(pos, exits):
    return min(abs(pos[0] - e[0]) + abs(pos[1] - e[1]) for e in exits) if exits else inf


def cell_cost(grid, pos, exits, weights):
    cell = cell_at(grid, pos)
    typ = cell_type(cell)
    risk = intensity(cell) if typ == "risk" else 0
    crowd = intensity(cell) if typ == "crowd" else 0
    blockage = 1 if typ == "blocked" else 0
    # Exit accessibility is a small normalized penalty for being farther from any exit.
    max_dim = max(len(grid), len(grid[0]), 1)
    exit_access = manhattan_to_nearest_exit(pos, exits) / max_dim
    return (
        weights.alpha * 1
        + weights.beta * crowd
        + weights.gamma * risk
        + weights.delta * blockage
        + weights.epsilon * exit_access
    )


def path_metrics(grid, path, exits, weights):
    if not path:
        return {"distance": 0, "risk_score": 0, "crowd_score": 0, "total_cost": 0}
    risk = 0.0
    crowd = 0.0
    total = 0.0
    for pos in path[1:]:
        cell = cell_at(grid, pos)
        typ = cell_type(cell)
        if typ == "risk":
            risk += intensity(cell)
        if typ == "crowd":
            crowd += intensity(cell)
        total += cell_cost(grid, pos, exits, weights)
    return {
        "distance": max(len(path) - 1, 0),
        "risk_score": risk,
        "crowd_score": crowd,
        "total_cost": round(total, 3),
    }


def reconstruct(prev, start, goal):
    cur = tuple(goal)
    out = [list(cur)]
    while cur != tuple(start):
        cur = prev.get(cur)
        if cur is None:
            return []
        out.append(list(cur))
    out.reverse()
    return out
