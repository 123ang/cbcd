# Phase 1 code audit — CBCD

**Date:** 2026-05-13  
**Scope:** Phase 1 prototype (FastAPI backend + React/Vite frontend + docs).  
**Reviewed:** `backend/main.py`, `backend/algorithms/pathfinding.py`, `backend/utils/{grid,models}.py`, `backend/{tests,smoke_test,run_experiments}.py`, `backend/data/{scenarios.json,experiment_logs.csv}`, `frontend/src/main.jsx`, `frontend/src/styles.css`, `frontend/src/api/navigationApi.js`, `frontend/index.html`, `frontend/.env`, `frontend/package.json`, `LOCAL_TESTING.md`, `DEPLOY_VPS.md`, `docs/*`, `.gitignore`.

**Headline:** The prototype does the right things — Dijkstra/A\* baselines, risk-aware Weighted A\*, Q-learning, scenario library, evaluation CSV, and a dashboard with comparison table and route overlays. It will demo. There are correctness and thesis-defensibility issues to fix before Chapter 4/5 evidence collection, plus several UI sharp edges.

---

## 1. Critical / thesis-blocking

These are likely to be questioned by an examiner.

### 1.1 Naming clash: `α` is doing two unrelated jobs in Weighted A\*

In `backend/algorithms/pathfinding.py::_search`, `weights.alpha` (the **distance cost coefficient** in the cost model) is reused as the **heuristic inflation** for Weighted A\* (`f = g + w·h`). In the literature these are different:

- `α` in the cost model = how much distance matters on each step.
- `w` in `f = g + w·h` = how much the heuristic is trusted; trades optimality for speed.

With Default `α=1` this coincidentally matches plain A\*. With Distance-heavy `α=3`, “Weighted A\*” also inflates the heuristic (bounded-suboptimal behaviour), which can diverge from what you claim in the proposal.

**Recommendation:** Add a separate field (e.g. `weights.heuristic_weight` or a constant `1.0`) for the `w` in `f = g + w·h`, and stop reusing `alpha`.

### 1.2 `exit_access` is added to every edge cost (double-bias toward goal)

`backend/utils/grid.py::cell_cost` adds `epsilon × exit_access` where `exit_access` is normalized Manhattan distance to the nearest exit. That behaves like a **potential field** on every cell, not only a path attribute, and it overlaps the role of the A\* heuristic in Weighted A\*.

Effects:

- Dijkstra (no heuristic) becomes biased toward exits — surprising for a “shortest-path baseline”.
- Weighted A\* gets stacked gradients (cost + heuristic + exit_access), weakening comparability to standard A\* in the literature.

**Recommendation:** Either remove `exit_access` from **per-step** cost and report it only as a **path-level metric** in the table, or apply exit accessibility as a **one-shot term** (e.g. only at the goal) instead of every step.

### 1.3 Q-learning `nodes_expanded` is misleading

In `pathfinding.py::qlearning`, `nodes` counts **every training step** (often tens of thousands), then is exposed in the same column as A\*’s search-node count (~24). The comparison table therefore mixes **training effort** with **search effort**.

**Recommendation:** Split columns (e.g. `search_nodes` vs `train_steps`) or rename the UI column per algorithm family.

### 1.4 Q-learning is not “pure” Q-learning

`_reward` adds **potential-based shaping** (commented in code). That is honest engineering, but the thesis should label it clearly (e.g. “Q-learning with potential-based reward shaping”) or provide a flag to disable shaping for at least one ablation run.

### 1.5 Q-learning greedy reconstruction can fail silently

When the greedy policy loops or gets stuck, the path is cleared and `success=false` with little diagnostic for the UI.

**Recommendation:** Return partial path + flags (`truncated`, `reason`) so the dashboard can explain failure.

### 1.6 Start fallback to `[0,0]` can be invalid

`applyPaint` moves Start to `[0,0]` when painting over the start cell. If `(0,0)` is a wall or exit, algorithms fail with no clear user message.

**Recommendation:** Refuse the paint, or relocate Start to the nearest empty cell.

---

## 2. High priority (correctness + developer experience)

| Issue | Notes |
|-------|--------|
| `/load-scenario` returns full ~264 KB JSON | Populate dropdown with a lightweight `GET /scenarios` listing; fetch full scenario on select. |
| `/export-results` appends forever | Double-clicks duplicate rows; consider dedupe by `(scenario, algorithm, weights)`. |
| CORS `allow_origins=["*"]` + `credentials` | Fine for local dev; production should list real origins per `DEPLOY_VPS.md`. |
| `frontend/package.json` uses `"latest"` | Pin versions for reproducibility; commit lockfile. |
| `lucide-react` unused | Remove or use for toolbar icons. |
| Tests are scripts, not pytest | Migrate to pytest + `TestClient` for API smoke tests. |
| No API-level tests | Cover empty grid, no exits, malformed JSON, unknown algorithm in `compare-selected`. |
| No frontend tests | At least one Vitest test with stubbed `api` for regression safety. |

---

## 3. UI / UX

### 3.1 First impression

- Strong pink accent + dark sidebar reads more “product dashboard” than “academic decision support”; consider a calmer accent and reserve high-saturation colors for warnings.
- Add a one-line **empty state** in the main panel: what to do first (load scenario or paint, then Run).

### 3.2 Comparison table

- Right-align numeric columns; left-align algorithm names.
- Winning row highlight (`.win`) is subtle; consider a **left border** accent on the row.
- Show **delta vs baseline** (e.g. Dijkstra) per metric — that is the thesis story at a glance.
- Sortable headers: add `aria-sort` for accessibility.

### 3.3 Route overlay

- Multiple colored outlines on one cell get noisy; consider **SVG polylines** between cell centers instead of per-cell outlines.
- Some route colors are too close to crowd cell blues; increase contrast or use dashed line styles per algorithm.

### 3.4 Replay control

The “Replay paths” control resets `pathProgress` then jumps to `Infinity`; animation may not re-run reliably. Re-trigger via a dedicated `replayKey` (or similar) in the `useEffect` dependency list.

### 3.5 Sidebar density

Many sections stack in a fixed-width sidebar; on 1280×720 users scroll sidebar and grid. Use **collapsible sections** (`<details>`): default-open Run + Algorithms; default-closed Generators, Weights, I/O.

Move **animation speed** next to Run buttons (it is currently under route overlays).

### 3.6 Painting performance

Large grids re-render all cells on drag. Consider `React.memo` on cells or a canvas layer for 50×50+.

### 3.7 Validation

- `importScenario`: wrap `JSON.parse` in try/catch and surface errors in the existing error banner.
- Before Run: require at least one exit and a valid Start on an empty cell.

### 3.8 Microcopy

- Recommendation “top contributors” should omit zero-valued factors and include units.
- Replace `alert()` for CSV export with a non-blocking toast.

### 3.9 Color semantics

- Red exits can be read as “danger”; consider teal for exits or a small “E” glyph.
- Document color–meaning mapping in the legend (already partly there).

### 3.10 Accessibility (baseline 95/100)

- Add `role="alert"` on error messages.
- Stronger visible focus rings on interactive cells.
- Slightly larger / higher-contrast shortcut hint text.

---

## 4. Architecture / maintainability

- **`main.jsx` monolith:** Split into `App`, `Sidebar`, `Grid`/`Cell`, `Comparison`, `Legend`, and small `lib/*` modules.
- **`styles.css` as one long line:** Reformat for readable diffs; consider Tailwind if the team prefers utility-first CSS.
- **`scenarios.json` size:** Large JSON hurts `git diff`; consider per-scenario files or a compact encoding + loader.
- **Q-tables on disk:** Correctly gitignored; optional `cache` flag to skip writes in CI.

### Smaller notes

- `useEffect` for global `keydown` has no dependency array → listener rebound every render; narrow dependencies or use refs.
- `defaultScenario()` hard-codes start position; ensure `clearBoard()` and arbitrary `(rows,cols)` stay in bounds.
- Confirm `frontend/dist/` is not tracked in git if present locally.

---

## 5. What is already strong

- **Single source of truth** for step cost: `utils/grid.py::cell_cost` + `path_metrics` used consistently across algorithms.
- **Q-table persistence** by scenario hash supports reproducible runs.
- **`run_experiments.py`:** S1–S6 × three weight presets × four algorithms → CSV ready for evaluation chapters.
- **Pydantic models** (`ScenarioRequest`, `RouteResult`) keep the API contract explicit.
- **Lighthouse accessibility** documented (95/100) with JSON artifact.
- **DSRM mapping** in `docs/phase1_academic_notes.md` aligns implementation with methodology.
- **`DEPLOY_VPS.md`:** Practical Nginx `/api` proxy + systemd + Certbot path.

---

## 6. Recommended fix order

1. Decouple **heuristic weight** from **`alpha`** in Weighted A\* (§1.1).
2. Rework **`exit_access`** so it does not distort Dijkstra baseline (§1.2).
3. Split or rename **Q-learning node / step counts** in the comparison table (§1.3).
4. Fix **replay** animation trigger (§3.4).
5. **Table UX:** right-align numbers, delta vs baseline, stronger winner row, `aria-sort` (§3.2).
6. **Validation:** import errors, exit required, safe Start relocation (§1.6, §3.7).
7. **Pin frontend dependencies**; remove or use **lucide-react** (§2).
8. **pytest + API tests** (§2).

---

## 7. References in-repo

| Document | Role |
|----------|------|
| `to-do.md` | Living Phase 1 task list |
| `docs/phase1_academic_notes.md` | DSRM + scope |
| `docs/risk_factor_definition_table.md` | Cost model factors |
| `LOCAL_TESTING.md` | How to run tests and Lighthouse |
| `DEPLOY_VPS.md` | Production-style deploy |

This audit is advisory; implement changes in small PRs aligned with thesis narrative (especially §1.1–§1.2 before collecting final experiment numbers).
