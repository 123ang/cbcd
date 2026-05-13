# Local Testing Guide — CBCD Phase 1

This guide shows how to run and test the Phase 1 prototype locally.

## 1. Project location

```bash
cd /Users/123ang/Desktop/Websites/cbcd
```

## 2. Start the backend

Open Terminal tab 1:

```bash
cd /Users/123ang/Desktop/Websites/cbcd/backend

# Create virtual environment if not created yet
python3 -m venv .venv

# Activate it
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI backend
uvicorn main:app --reload --port 8001
```

Backend should run at:

```text
http://localhost:8001
```

Quick health check:

```bash
curl http://localhost:8001/health
```

Expected result:

```json
{"ok":true,"phase":"phase_1"}
```

## 3. Start the frontend

Open Terminal tab 2:

```bash
cd /Users/123ang/Desktop/Websites/cbcd/frontend

# Install frontend dependencies if not installed yet
npm install

# Start Vite frontend
npm run dev
```

Open the URL shown by Vite, usually:

```text
http://localhost:5173
```

## 4. Manual demo test

In the web dashboard:

1. Load built-in scenario: **S2 Risk zone on shortest path**
2. Click **Run all**
3. Check the comparison table:
   - Dijkstra / A* should usually pick a shorter route with higher risk.
   - Weighted A* should pick a longer but safer route.
   - Q-learning should also return a learned safe route.
4. Confirm the recommendation panel shows the lowest total-cost successful route.
5. Toggle route overlays to compare paths visually.
6. Try changing weights:
   - **Distance-heavy** should prefer shorter routes.
   - **Safety-heavy** should avoid risk/crowd more strongly.

## 5. Backend automated tests

From project root:

```bash
cd /Users/123ang/Desktop/Websites/cbcd

PYTHONPATH=backend backend/.venv/bin/python backend/smoke_test.py
PYTHONPATH=backend backend/.venv/bin/python backend/tests.py
```

Expected output includes:

```text
backend smoke test passed
all backend tests passed
```

## 6. Run experiment harness

This runs S1–S6 with three weight presets and writes the evaluation CSV.

```bash
cd /Users/123ang/Desktop/Websites/cbcd
PYTHONPATH=backend backend/.venv/bin/python backend/run_experiments.py
```

Expected output:

```text
Wrote 72 rows to .../backend/data/experiment_logs.csv
```

CSV output path:

```text
backend/data/experiment_logs.csv
```

## 7. Frontend build test

```bash
cd /Users/123ang/Desktop/Websites/cbcd/frontend
npm run build
```

Expected output:

```text
✓ built
```

## 8. Accessibility test

Optional, but useful before submission or Cursor review:

```bash
cd /Users/123ang/Desktop/Websites/cbcd/frontend
npm run build
npm run preview -- --port 4173
```

Then in another terminal:

```bash
cd /Users/123ang/Desktop/Websites/cbcd/frontend
npx --yes lighthouse http://localhost:4173 \
  --only-categories=accessibility \
  --chrome-flags='--headless --no-sandbox' \
  --output=json \
  --output-path=../docs/lighthouse-accessibility.json \
  --quiet
```

Current target:

```text
Accessibility score >= 90
```

The last verified score was **95/100**.

## 9. Common problems

### Backend says module not found

Run commands from the project root with `PYTHONPATH=backend`, for example:

```bash
PYTHONPATH=backend backend/.venv/bin/python backend/tests.py
```

### Frontend cannot connect to backend

Make sure backend is running on port 8001:

```bash
curl http://localhost:8001/health
```

### Port already in use

Use another port:

```bash
uvicorn main:app --reload --port 8001
```

If frontend needs another backend URL:

```bash
VITE_API_BASE=http://localhost:8001 npm run dev
```

## 10. What to show Cursor

Ask Cursor to inspect:

- `backend/main.py`
- `backend/algorithms/pathfinding.py`
- `backend/run_experiments.py`
- `backend/tests.py`
- `frontend/src/main.jsx`
- `frontend/src/styles.css`
- `docs/phase1_academic_notes.md`
- `docs/risk_factor_definition_table.md`
- `to-do.md`

Main claim to verify:

```text
Phase 1 demonstrates that the shortest route is not always the safest route by comparing Dijkstra, A*, Weighted A*, and Q-learning under risk/crowd-aware cost metrics.
```
