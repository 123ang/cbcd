import hashlib
import heapq
import json
import random
import time
from math import inf
from pathlib import Path

from utils.grid import cell_cost, cell_type, in_bounds, intensity, manhattan_to_nearest_exit, neighbors, passable, path_metrics, reconstruct
from utils.models import RouteResult

ACTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]


def _search(req, algorithm: str, weighted: bool = False, heuristic: bool = False):
    started = time.perf_counter()
    start = tuple(req.start)
    exit_set = {tuple(e) for e in req.exits}
    pq = [(0, start)]
    dist = {start: 0.0}
    prev = {}
    visited = set()
    goal = None
    nodes = 0

    while pq:
        _, cur = heapq.heappop(pq)
        if cur in visited:
            continue
        visited.add(cur)
        nodes += 1
        if cur in exit_set:
            goal = cur
            break
        for nb in neighbors(req.grid, list(cur)):
            nb_t = tuple(nb)
            step = cell_cost(req.grid, nb, req.exits, req.weights) if weighted else 1
            new_g = dist[cur] + step
            if new_g < dist.get(nb_t, inf):
                dist[nb_t] = new_g
                prev[nb_t] = cur
                h = manhattan_to_nearest_exit(nb, req.exits) if heuristic else 0
                priority = new_g + (req.weights.alpha * h if weighted else h)
                heapq.heappush(pq, (priority, nb_t))

    path = reconstruct(prev, req.start, list(goal)) if goal else []
    metrics = path_metrics(req.grid, path, req.exits, req.weights)
    return RouteResult(
        algorithm=algorithm,
        success=bool(path),
        path=path,
        distance=metrics["distance"],
        risk_score=metrics["risk_score"],
        crowd_score=metrics["crowd_score"],
        total_cost=metrics["total_cost"],
        time_ms=round((time.perf_counter() - started) * 1000, 3),
        nodes_expanded=nodes,
        weights=req.weights,
    )


def dijkstra(req):
    return _search(req, "dijkstra", weighted=False, heuristic=False)


def astar(req):
    return _search(req, "astar", weighted=False, heuristic=True)


def weighted_astar(req):
    return _search(req, "weighted_astar", weighted=True, heuristic=True)


def _scenario_hash(req):
    payload = {
        "grid": req.grid,
        "start": req.start,
        "exits": req.exits,
        "weights": req.weights.model_dump(),
    }
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha1(raw.encode()).hexdigest()[:16]


def _reward(req, state, next_state, invalid=False):
    if invalid:
        return -100.0
    if tuple(next_state) in {tuple(e) for e in req.exits}:
        return 100.0
    cell = req.grid[next_state[0]][next_state[1]]
    reward = -1.0
    if cell_type(cell) == "risk":
        reward -= 30.0 * intensity(cell)
    if cell_type(cell) == "crowd":
        reward -= 15.0 * intensity(cell)
    # Potential shaping: learning still uses Q-learning, but this helps converge quickly on thesis-size grids.
    before = manhattan_to_nearest_exit(state, req.exits)
    after = manhattan_to_nearest_exit(next_state, req.exits)
    reward += max(min(before - after, 1), -1) * 2.0
    return reward


def qlearning(req):
    started = time.perf_counter()
    rows, cols = len(req.grid), len(req.grid[0])
    start = tuple(req.start)
    exits = {tuple(e) for e in req.exits}
    seed = int(_scenario_hash(req), 16)
    rng = random.Random(seed)
    q = {}
    nodes = 0

    def values(state):
        return q.setdefault(f"{state[0]},{state[1]}", [0.0, 0.0, 0.0, 0.0])

    def step(state, action_idx):
        dr, dc = ACTIONS[action_idx]
        nr, nc = state[0] + dr, state[1] + dc
        if not in_bounds(req.grid, nr, nc) or not passable(req.grid, nr, nc):
            return state, _reward(req, state, state, invalid=True), False, True
        nxt = (nr, nc)
        done = nxt in exits
        return nxt, _reward(req, state, nxt), done, False

    alpha = 0.55
    gamma = 0.88
    max_steps = max(rows * cols * 3, 80)
    episodes = min(2600, max(900, rows * cols * 3))

    for episode in range(episodes):
        state = start
        epsilon = max(0.04, 0.45 * (1 - episode / episodes))
        for _ in range(max_steps):
            nodes += 1
            qs = values(state)
            if rng.random() < epsilon:
                action_idx = rng.randrange(len(ACTIONS))
            else:
                # Deterministic tie break toward the nearest exit.
                best = max(qs)
                candidates = [i for i, v in enumerate(qs) if v == best]
                action_idx = min(candidates, key=lambda i: manhattan_to_nearest_exit((state[0] + ACTIONS[i][0], state[1] + ACTIONS[i][1]), req.exits))
            nxt, reward, done, invalid = step(state, action_idx)
            nxt_values = values(nxt)
            qs[action_idx] += alpha * (reward + gamma * max(nxt_values) - qs[action_idx])
            if done:
                break
            if not invalid:
                state = nxt

    path = [list(start)]
    state = start
    seen = {state}
    for _ in range(max_steps):
        if state in exits:
            break
        qs = values(state)
        ranked = sorted(range(len(ACTIONS)), key=lambda i: (qs[i], -manhattan_to_nearest_exit((state[0] + ACTIONS[i][0], state[1] + ACTIONS[i][1]), req.exits)), reverse=True)
        moved = False
        for action_idx in ranked:
            nxt, _, done, invalid = step(state, action_idx)
            if invalid or nxt in seen:
                continue
            state = nxt
            seen.add(state)
            path.append(list(state))
            moved = True
            if done:
                break
            break
        if not moved or state in exits:
            break

    success = bool(path and tuple(path[-1]) in exits)
    if not success:
        path = []
    metrics = path_metrics(req.grid, path, req.exits, req.weights)
    q_dir = Path(__file__).resolve().parents[1] / "data" / "q_tables"
    q_dir.mkdir(parents=True, exist_ok=True)
    (q_dir / f"{_scenario_hash(req)}.json").write_text(json.dumps({"q": q, "episodes": episodes, "success": success}))
    return RouteResult(
        algorithm="qlearning",
        success=success,
        path=path,
        distance=metrics["distance"],
        risk_score=metrics["risk_score"],
        crowd_score=metrics["crowd_score"],
        total_cost=metrics["total_cost"],
        time_ms=round((time.perf_counter() - started) * 1000, 3),
        nodes_expanded=nodes,
        weights=req.weights,
        explanation=f"Q-learning trained {episodes} episodes with epsilon-greedy exploration; Q-table persisted by scenario hash.",
    )
