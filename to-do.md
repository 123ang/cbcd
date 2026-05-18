# To-Do — Two-Phase Risk-Aware Indoor Navigation & Crowd Detection

**Project:** A Two-Phase Risk-Aware Indoor Navigation and Camera-Based Crowd Detection Decision-Support System for Confined Environments.

This to-do is the working plan for the proposal in `Two_Phase_Risk_Aware_Navigation_Crowd_Detection_Proposal.md`. It maps every task to a Research Objective (RO), so progress on the system also closes thesis gaps.

---

## 0. Conventions

- **RO1–RO6**, **RQ1–RQ6** are from the proposal §6.
- Items are written as checkboxes for tracking.
- “System” = code/artifact; “Academic” = thesis/paper output.
- **Right now we are focused on Phase 1 only** (sections 2–4 below). Phase 2 (YOLO) is parked until Phase 1 demo works end-to-end.

---

## 0.1 Phase 1 Sprint Plan (build order)

Do these in order — each step has something demoable at the end.

| Step | Goal | Tasks |
|-----:|------|-------|
| **1** | Project scaffold | React + Vite + Tailwind frontend; FastAPI backend skeleton; `scenarios.json` empty file; agreed JSON shape for grid/weights. |
| **2** | Map editor MVP (algo-vz parity) | Grid component, rows/cols input + Resize, paint Wall/Empty, drag Start + Exit, Clear board. |
| **3** | Map editor extensions | Risk / Crowd cells with intensity 1–3, multiple Exits, Blocked, Undo/Redo, JSON export/import. |
| **4** | Dijkstra + A\* on backend | Endpoints return `{path, distance, time_ms, success}`; map editor can “Run Dijkstra” and animate. |
| **5** | Cost model + Weighted A\* | Implement `α·dist + β·crowd + γ·risk + δ·blockage + ε·exit_access`; weight sliders in UI. |
| **6** | Algorithm Comparison page | “Run all 4” button (Q-learning is allowed to be stub at this step); table of metrics; route overlay. |
| **7** | Q-learning | Training endpoint, persisted Q-table per scenario, replace the stub. |
| **8** | Scenario library S1–S6 | Save the six proposal scenarios as JSON; dropdown to load each instantly. |
| **9** | Experiment harness | Script that runs all scenarios × 3 weight presets and writes `experiment_logs.csv`. |
| **10** | Phase 1 demo polish | Recommendation panel, explanation (“route chosen because crowd cost dominated”), screenshots / screen recording for thesis Chapter 4. |

**Exit criteria for Phase 1:** the final demo scenario in §12 runs from the dashboard, the comparison table populates, and the recommendation panel can explain its choice.

> Implementation note (2026-05-12): Phase 1 code now includes real Q-learning, comparison/export endpoints, S1–S6 scenarios, experiment harness, and frontend comparison controls. Phase 2 remains parked.
> Cursor handoff polish: recursive division, error boundary, generated-file ignore rules, and backend scenario tests have been added.
> Stage A-C note (2026-05-18): App now includes status cards, Dijkstra baseline delta/reduction evidence fields, and a separate Floor Plan Planning tab with image/PDF manual overlay tracing. Phase 2 YOLO remains parked.

---

## 1. Research Setup (do before coding)

- [x] Restate **research aim** in one paragraph (proposal §5) for the thesis intro.
- [x] Lock the six **ROs / RQs** (proposal §6) and keep this list in sync.
- [x] Confirm methodology = **Design Science Research (DSRM)** with stages: problem → objectives → design → demonstration → evaluation → communication (proposal §13).
- [x] Define **scope** and **limitations** explicitly (proposal §18, §19) so the prototype is judged correctly (decision support, not certified evacuation).
- [x] Build a literature matrix using the references in proposal §References (Dijkstra/A\*, Weighted A\*, Q-learning / DQN path planning, YOLO crowd counting, evacuation routing).

---

## 2. RO1 — Identify spatial and environmental risk factors

> RQ1: What factors should a risk-aware indoor navigation system consider?

- [x] List the **five factors** used in the cost model:
  - Distance
  - Obstacles / blockage
  - Risk zones (hazard)
  - Crowd density
  - Exit accessibility
- [x] Justify each factor with at least 1 citation (use the proposal's references list as the seed).
- [x] Map each factor to a **cell type** used in the grid (Empty, Wall, Start, Exit, Risk, Crowd, Blocked).
- [x] Output: a short “Risk Factor Definition Table” for the thesis (factor → definition → measurement unit → source).

---

## 3. RO2 — Build the simulation-based risk-aware navigation model (Phase 1 core)

> RQ2: How can the 2D model integrate distance, obstacles, risk zones, crowd density, and exit accessibility?

### 3.1 React dashboard (frontend)

- [x] Scaffold **React + Vite + Tailwind**.
- [x] Pages: **Dashboard**, **Map Editor**, **Algorithm Comparison**, **Scenario Testing**, **Result Visualization**, **Crowd Detection** (Phase 2 stub).
- [x] Shared layout: sidebar / top nav, theme, error boundary.
- [x] State store for current scenario (cells, weights, results).

### 3.2 2D map editor (algo-vz-inspired, extended for risk + crowd)

Reference UX: [algo-vz.netlify.app](https://algo-vz.netlify.app/). The thesis editor must go beyond it to support the cost model.

**Grid configuration**

- [x] Inputs for **rows** and **cols** with explicit **“Resize grid”** button (no live destructive resize).
- [x] Size presets: **20×20**, **30×30**, **40×40**, **50×50**.
- [x] Hard cap **80×80** (so Q-learning training stays feasible on a laptop).
- [x] Confirm dialog when resizing if any non-empty cells exist.
- [x] Cell pixel size auto-scales to viewport; min 12 px, max 32 px.

**Cell palette (extended beyond algo-vz)**

- [x] Tool buttons: **Empty, Wall, Start, Exit, Risk, Crowd, Blocked, Eraser**.
- [x] Exactly one **Start**; allow **multiple Exits** (required for Scenario S4).
- [x] **Intensity levels** for Risk and Crowd (1 / 2 / 3) — feeds RO5 thresholds, not just on/off.
- [x] Color legend visible on the editor page.

**Interactions**

- [x] Click to paint single cell.
- [x] Click-and-drag to paint a stroke (with `requestAnimationFrame` throttle).
- [x] **Drag Start / Exit** to move (algo-vz style) without entering paint mode.
- [x] Right-click to erase; or hold `Shift`+drag to erase.
- [x] Undo / Redo (keep last 50 actions).
- [x] **Clear board** + **Clear walls only** + **Clear results only**.

**Maze / map generators (optional but very useful for testing)**

- [x] Random walls (density slider).
- [x] **Recursive Division** (vertical / horizontal skew).
- [x] Simple spiral / corridor template.
- [x] **Add risk / crowd hot-spots** after generation (separate button).

**Run controls**

- [x] Algorithm chooser: Dijkstra / A\* / Weighted A\* / Q-learning.
- [x] **Run all four** button (lights up the Comparison page).
- [x] Animation speed: **Slow / Normal / Fast / Instant**.
- [x] **Step / Pause / Resume / Replay** for thesis demos.
- [x] Toggle: show **frontier (visited cells)** vs **final route only**.

**Visualization**

- [x] Cell color states: Unvisited, Visited, On-path, Wall, Start, Exit, Risk(1–3), Crowd(1–3), Blocked.
- [x] **Route overlay**: each algorithm’s final path drawn in a distinct color (so one screenshot can show 4 routes).
- [x] Hover tooltip: cell `(row, col)`, type, cost contribution.

**Weights panel (lives next to the editor)**

- [x] Sliders for `α, β, γ, δ, ε` with current numeric value visible.
- [x] Presets: **Default**, **Distance-heavy**, **Safety-heavy** (for sensitivity analysis).
- [x] Show **current total route cost** under each algorithm result.

**Scenario I/O**

- [x] **Export Scenario** → JSON (grid, weights, metadata: name, date, notes).
- [x] **Import Scenario** → repaints grid + restores weights.
- [x] Built-in scenarios: S1–S6 selectable from a dropdown (loads instantly).
- [x] Save scenarios under `backend/data/scenarios.json`.

**Quality / a11y**

- [x] Keyboard shortcuts: `1`–`7` to switch tool, `R` run, `C` clear, `Z` undo, `Shift+Z` redo.
- [x] Responsive (works on a laptop display down to 1280×720).
- [x] Lighthouse a11y ≥ 90.

### 3.3 FastAPI backend

- [x] FastAPI project layout (`backend/main.py`, `algorithms/`, `utils/`, `data/`).
- [x] Endpoints (align with proposal §12):
  - [x] `POST /run-dijkstra`
  - [x] `POST /run-astar`
  - [x] `POST /run-weighted-astar`
  - [x] `POST /run-qlearning`
  - [x] `POST /compare-algorithms`
  - [x] `POST /save-scenario`
  - [x] `GET  /load-scenario`
  - [x] `POST /camera/crowd` (Phase 2)
- [x] Request/response schemas via Pydantic; same JSON shape on all algorithm endpoints.

### 3.4 Cost model (the academic core)

- [x] Implement weighted cost per cell:
  `cell_cost = α·dist + β·crowd + γ·risk + δ·blockage + ε·exit_access`
- [x] Default weights to seed: distance=1, crowd=3, risk=5, blockage=10, exit access=2.
- [x] Expose **adjustable weights** from the dashboard (RQ2 evidence: weights drive route choice).
- [x] Save the **chosen weights with each experiment log** (for the evaluation chapter).

---

## 4. RO3 — Compare Dijkstra, A\*, Weighted A\*, and Reinforcement Learning

> RQ3: How does the proposed model perform vs Dijkstra, A\*, Weighted A\*, and RL?

### 4.1 Dijkstra (baseline 1)

- [x] Implement on grid; return path, distance, computation time.
- [x] Unit test on a hand-checked 5×5 map.

### 4.2 A\* (baseline 2)

- [x] Manhattan-distance heuristic.
- [x] Same I/O shape as Dijkstra.
- [x] Confirm A\* is ≤ Dijkstra time on open maps.

### 4.3 Weighted A\* (proposed risk-aware)

- [x] Reuse cost model from §3.4 as edge cost.
- [x] Heuristic: scaled Manhattan; document admissibility trade-off.
- [x] Confirm it can pick a **longer-but-safer route** on risk-on-shortest-path scenarios.

### 4.4 Q-learning module

- [x] Define environment (state=cell, actions={U,D,L,R}).
- [x] Reward table from proposal §8.3 (Exit +100, Wall −100, Risk −30, Crowd −15, Step −1).
- [x] ε-greedy training; persist Q-table per map.
- [x] Generate the learned route and return same metrics as the other algos.

### 4.5 Comparison output (the headline thesis visual)

**Goal:** for any map the user builds, run **every algorithm the user selected**, list each route + its time, and clearly mark **the best performer**.

**Run contract**

Every algorithm returns the same JSON shape:

```json
{
  "algorithm": "weighted_astar",
  "success": true,
  "path": [[r0,c0], [r1,c1], ...],
  "distance": 24,
  "risk_score": 4,
  "crowd_score": 6,
  "total_cost": 42.0,
  "time_ms": 3.7,
  "nodes_expanded": 312,
  "weights": { "alpha":1, "beta":3, "gamma":5, "delta":10, "epsilon":2 }
}
```

**Comparison table columns**

| # | Column | Lower-is-better? | Notes |
|---|--------|------------------|-------|
| 1 | Algorithm | – | Dijkstra / A\* / Weighted A\* / Q-learning |
| 2 | Success | high-is-better | ✓ reached an exit |
| 3 | Distance (steps) | yes | path length |
| 4 | Risk exposure | yes | sum of risk intensity on path |
| 5 | Crowd exposure | yes | sum of crowd intensity on path |
| 6 | **Total cost** | yes | with current `α,β,γ,δ,ε` |
| 7 | Time (ms) | yes | wall-clock per run |
| 8 | Nodes expanded | yes | search effort |

- [x] Highlight the **best cell per metric** (green badge).
- [x] Highlight the **overall winner row** (lowest Total cost among successful routes) with a distinct color.
- [x] If multiple algorithms tie on the winning metric, mark them all.
- [x] Sortable by any column (default: Total cost ascending).
- [x] Show **chosen weights** above the table so the comparison is reproducible.

**Route overlay panel**

- [x] One map, all selected algorithms’ paths drawn at once:
  - Dijkstra → red
  - A\* → blue
  - Weighted A\* → green
  - Q-learning → orange
- [x] Toggle each path on/off.
- [x] Legend with line thickness and color.

**Recommendation panel**

- [x] One sentence verdict, e.g. *“Weighted A\* recommended — total cost 42 (35% lower than A\*); avoided 2 risk cells.”*
- [x] Bullet list of the **dominant factor** per algorithm:
  - “A\* won on time (1.1 ms) but exposed the user to 3 risk cells.”
  - “Q-learning matched Weighted A\* on safety but used 4× more time.”
- [x] “Why this route?” block: top 3 cost contributors along the chosen path.

**User control**

- [x] Checkbox list to select which algorithms to run.
- [x] **Run selected** and **Run all** buttons.
- [x] Results persist until the map is edited; editing the map auto-marks results as stale.
- [x] **Export results** → CSV row appended to `experiment_logs.csv` (algorithm × scenario × weights × metrics).

---

## 5. RO4 — Camera-based crowd detection with pretrained YOLO (Phase 2 core)

> RQ4: How can pretrained YOLO be used to detect and count people?

- [ ] Pick model (e.g. **YOLOv8n** for speed) and pin a version.
- [ ] Video Input module:
  - [ ] Recorded video first (file upload / path).
  - [ ] Webcam feed after recorded video works.
- [ ] YOLO detector: detect `person` class only, draw bounding boxes, return `(count, frame_ts)`.
- [ ] People counting: rolling average over N frames (e.g. 5 s window) to avoid flicker.
- [ ] Save per-zone count time series to `experiment_logs.csv`.

---

## 6. RO5 — Convert crowd level to crowd-risk score

> RQ5: How can crowd levels update the navigation model?

- [ ] Implement density: `density = people / area_m2`.
- [ ] Threshold table (proposal §10.3):
  - 0–1.0 → Normal (1)
  - 1.1–2.5 → Moderate (3)
  - 2.6–4.6 → Crowded (6)
  - 4.7+ → High Risk (9)
- [ ] Output schema:
  ```json
  { "zone": "Corridor A", "people_count": 18, "density": 3.0, "status": "Crowded", "risk_score": 6 }
  ```
- [ ] **Dynamic route update**: when a zone's `risk_score` changes, re-call `/compare-algorithms` and surface the before/after route on the dashboard.

---

## 7. RO6 — Evaluation, scenarios and metrics

> RQ6: How effective is the system vs distance-based routing?

### 7.1 Scenario set (proposal §14)

- [x] **S1:** Normal layout (all algorithms must find a valid route).
- [x] **S2:** Risk zone on shortest path (Weighted A\* / Q-learning should detour).
- [x] **S3:** Crowded main corridor (system should pick alternative).
- [x] **S4:** Blocked exit (system should redirect to another exit).
- [x] **S5:** Dynamic crowd update (camera input changes the route).
- [x] **S6:** Algorithm comparison sweep on a fixed map.

Save each scenario as JSON in `backend/data/scenarios.json`.

### 7.2 Metrics to log per run (proposal §15)

- [x] Route distance
- [x] Risk exposure score
- [x] Crowd exposure score
- [x] Total route cost
- [x] Computation time (ms)
- [x] Success rate (reaches an exit y/n)
- [x] Route safety improvement %
- [ ] Crowd classification accuracy (vs manual count)
- [ ] System usability (short rubric / questionnaire)
- [x] Decision explainability (does the panel state the dominant factor?)

Formula reminder:

```
Risk Reduction (%) = (Dijkstra Risk − Proposed Risk) / Dijkstra Risk × 100
```

### 7.3 Experiment harness

- [x] CLI / script that loads each scenario, runs all 4 algorithms, writes a row to `experiment_logs.csv`.
- [x] Re-run with at least 3 weight settings (default, distance-heavy, safety-heavy) to support sensitivity analysis.

---

## 8. MVP Checklists

### 8.1 Phase 1 MVP

- [x] React dashboard live
- [x] 2D grid map displayed
- [x] Mark Start / Exit / Walls / Risk / Crowd
- [x] Dijkstra, A\*, Weighted A\*, Q-learning all return a route
- [x] Comparison table renders
- [x] Recommendation explanation shown

### 8.2 Phase 2 MVP

- [ ] Recorded video input works
- [ ] YOLO detects `person`
- [ ] People count + density displayed
- [ ] Crowd status classified into risk score
- [ ] Risk score updates the map zone
- [ ] Route recalculated and **before/after** displayed

---

## 9. Folder structure (target)

```text
risk-aware-navigation-system/
├── frontend/
│   ├── src/
│   │   ├── components/    # GridMap, Toolbar, AlgorithmSelector, ComparisonTable, ResultPanel, VideoCrowdPanel
│   │   ├── pages/         # Dashboard, MapEditor, AlgorithmComparison, ScenarioTesting, CrowdDetection
│   │   ├── api/           # navigationApi.js
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── main.py
│   ├── algorithms/        # dijkstra.py, astar.py, weighted_astar.py, q_learning.py
│   ├── crowd_detection/   # yolo_detector.py, people_counter.py, crowd_classifier.py
│   ├── utils/             # grid_utils.py, cost_function.py, metrics.py
│   └── data/              # scenarios.json, experiment_logs.csv
└── README.md
```

---

## 10. Academic / writing tasks

These don’t live in code but must finish for the proposal to land.

- [ ] Chapter 1 — Introduction, problem statement, RO/RQ.
- [ ] Chapter 2 — Literature review (Dijkstra/A\*, Weighted A\*, RL/DQN for evacuation, YOLO crowd counting).
- [ ] Chapter 3 — Methodology (DSRM stages, system design, cost model derivation).
- [ ] Chapter 4 — Implementation (frontend, backend, algorithms, YOLO).
- [ ] Chapter 5 — Evaluation (scenarios S1–S6, metrics, tables, risk-reduction %).
- [ ] Chapter 6 — Discussion, limitations, future work (multi-floor, real-time camera, multi-agent RL).
- [ ] Chapter 7 — Conclusion + contributions (theoretical, technical, practical — see proposal §17).
- [ ] Diagrams: system architecture, Phase 1 flow, Phase 2 flow, algorithm flowcharts.
- [ ] Draft a conference/journal paper from Phase 1 results before Phase 2 starts.

---

## 11. Timeline (12-month plan from proposal §21)

| Month | Activity |
|-------|----------|
| 1 | Literature review + requirement analysis |
| 2 | System architecture + risk-cost model design |
| 3 | React dashboard + 2D map editor |
| 4 | Dijkstra, A\*, Weighted A\* |
| 5 | Q-learning module |
| 6 | Phase 1 testing + algorithm comparison |
| 7 | YOLO crowd detection module |
| 8 | Integrate crowd detection with navigation |
| 9 | Full system scenario testing |
| 10 | Evaluate + refine model |
| 11 | Thesis chapters + publication draft |
| 12 | Final prototype demo + documentation |

---

## 12. Final demo scenario (success criterion)

```text
Shortest path to Exit 1 goes through a crowded / high-risk corridor.

Result:
- Dijkstra and A\* pick the shortest path.
- Weighted A\* and Q-learning detour around the risky corridor.
- YOLO-based detection confirms the corridor is crowded.
- System updates the crowd-risk score and recommends a safer alternative.

Message:
A route should be short, safe, explainable, and responsive to crowd-risk conditions.
```
