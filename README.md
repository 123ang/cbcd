# CBCD — Risk-Aware Indoor Navigation Prototype

Phase 1 is a working React + FastAPI prototype for:

**A Two-Phase Risk-Aware Indoor Navigation and Camera-Based Crowd Detection Decision-Support System for Confined Environments**

| File / Folder | Purpose |
|---|---|
| `Two_Phase_Risk_Aware_Navigation_Crowd_Detection_Proposal.md` | Academic proposal |
| `to-do.md` | Phase-focused task list and comparison spec |
| `backend/` | FastAPI algorithm engine for Phase 1 |
| `frontend/` | React/Vite dashboard for Phase 1 |

## Phase 1 features included

- Top-level workspaces for **Scenario Builder** and **Floor Plan Planning**.
- Grid map editor with Empty, Wall, Start, Exit, Risk, Crowd, and Blocked cells.
- Manual floor-plan overlay planning with PNG/JPG upload, PDF page rendering, opacity/fit controls, and scenario JSON preservation.
- Adjustable risk/crowd intensity levels 1–3.
- Weight controls for `alpha`, `beta`, `gamma`, `delta`, `epsilon`.
- Backend endpoints for Dijkstra, A*, Weighted A*, real Q-learning, selected comparison, operator-only result export, and scenario I/O.
- Q-learning uses epsilon-greedy training, the proposal reward table, and deterministic scenario seeding. Q-table disk persistence is opt-in and capped.
- Built-in demo scenarios S1–S6 in `backend/data/scenarios.json`.
- Comparison table with distance, risk, crowd, total cost, time, nodes expanded, delta vs Dijkstra, risk/crowd reduction percentages, best metric highlights, and winning row.
- Route overlay toggles, selected-algorithm execution, replay animation speed, and sortable comparison table.
- Undo/redo, grid resize with 80×80 cap, random wall/risk-corridor/hotspot generators, clear walls/results controls, keyboard shortcuts.
- Recommendation panel that explains top cost contributors.
- Experiment harness writes `backend/data/experiment_logs.csv` for S1–S6 × three weight presets.
- Academic Phase 1 notes in `docs/phase1_academic_notes.md` and `docs/risk_factor_definition_table.md`.
- Public-domain manual overlay test asset: `frontend/public/sample_floorplan_wikimedia.jpg`, sourced from Wikimedia Commons.

## Run backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The public compute and camera routes are rate-limited. `/save-scenario` and
`/export-results` fail closed unless `CBCD_API_KEY` is configured and supplied
as `X-API-Key`. See `backend/.env.example` for the available controls. The
browser dashboard downloads result CSV files locally, so no operator key is
embedded in the frontend.

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the Vite URL, usually <http://localhost:5173>.

## Verify Phase 1

```bash
cd backend
PYTHONPATH=. .venv/bin/python smoke_test.py
PYTHONPATH=. .venv/bin/python tests.py
PYTHONPATH=. .venv/bin/python -m unittest -v test_api_safety.py
PYTHONPATH=. .venv/bin/python test_crowd_detector.py
PYTHONPATH=. .venv/bin/python run_experiments.py

cd ../frontend
npm test
npm run build
```

## Notes

Camera crowd analysis prefers YOLO and falls back to HOG when configured with
`CBCD_DETECTOR_BACKEND=auto`.
