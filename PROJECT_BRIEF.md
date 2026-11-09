# CBCD — project brief

Snapshot: **2026-10-24 MYT**, written by Codex from a repository read using Claude's collected facts. Dated orientation, not a live dashboard: recheck Git and runtime before status claims. History lives in [CHANGELOG.md](CHANGELOG.md).

## What it is

CBCD is a research decision-support prototype for risk-aware indoor navigation in confined environments. Its web dashboard models floor plans as a 2D grid, compares route algorithms under risk and crowd conditions, and includes an upload-based camera vision path that maps detected people to crowd levels. The proposal and project notes describe academic research use; no product owner or client is identified in the repo. ([README.md](README.md), [proposal](Two_Phase_Risk_Aware_Navigation_Crowd_Detection_Proposal.md), [Stage D plan](docs/stage_d_iphone_computer_vision_plan.md))

## Where things are

- Local checkout: `/Users/123ang/Desktop/Websites/cbcd`; branch `main`, HEAD `164f52b` (facts 2026-10-24; `git log origin/main`).
- GitHub: public repo [`123ang/cbcd`](https://github.com/123ang/cbcd), default branch `main` (facts 2026-10-24).
- Observed runtime copy: `~/server-runtime/projects/cbcd`, at `46ef465` on `main`; Docker container `server-restore-cbcd-api-1` was observed running (facts 2026-10-24). This runtime revision predates the current repo HEAD.
- Public URL: [https://cbcd.suntzutechnologies.com](https://cbcd.suntzutechnologies.com) returned HTTPS 200 on 2026-10-24 08:34 MYT. This confirms a page answered, not that the current repo revision or business flows are deployed (facts 2026-10-24).
- The repo also documents a separate Ubuntu VPS deployment path using Nginx and systemd; its current target and deployment revision are unverified ([DEPLOY_VPS.md](DEPLOY_VPS.md), [deploy.sh](deploy.sh)).

## Technology

| Layer | Technology | Version | Source |
|---|---|---|---|
| Frontend | React, React DOM | `^19.2.6` (lock: `19.2.6`) | [frontend/package.json](frontend/package.json), [frontend/package-lock.json](frontend/package-lock.json) |
| Frontend tooling | Vite | `^8.0.12` (lock: `8.3.4`) | [frontend/package.json](frontend/package.json), [frontend/package-lock.json](frontend/package-lock.json) |
| UI and PDF | lucide-react; pdfjs-dist | `^1.14.0`; `^6.4.299` | [frontend/package.json](frontend/package.json) |
| Backend | Python, FastAPI, Uvicorn, Pydantic, python-multipart | Python version not pinned; `>=0.124.0`, `>=0.38.0`, `>=2.12.0`, `>=0.0.20` | [backend/requirements.txt](backend/requirements.txt) |
| Vision and numeric | NumPy; OpenCV headless; Ultralytics | `1.26.4`; `4.10.0.84`; `>=8.4.0` | [backend/requirements.txt](backend/requirements.txt) |
| Route data | JSON scenarios, CSV experiment log; no database configured | File formats | [backend/data/scenarios.json](backend/data/scenarios.json), [backend/data/experiment_logs.csv](backend/data/experiment_logs.csv) |
| Hosting | FastAPI API and static Vite frontend; observed local Docker API runtime; documented Nginx/systemd VPS option | Runtime versions not confirmed | [DEPLOY_VPS.md](DEPLOY_VPS.md), facts 2026-10-24 |

## Architecture

- `frontend/src/main.jsx` contains the React dashboard, scenario editor, grid interactions, floor-plan workspace, camera workspace, route comparison and recommendation UI.
- `frontend/src/api/navigationApi.js` calls the FastAPI endpoints; `resultsCsv.js` builds browser-downloaded result files; `visionMapping.js` converts camera coverage and density into scenario crowd cells.
- `frontend/src/styles.css` contains the dashboard styles. `pdfjs-dist` renders uploaded floor-plan PDFs into browser-side image overlays.
- `backend/main.py` defines health, route, comparison, scenario I/O, result export and camera upload endpoints.
- `backend/algorithms/pathfinding.py` implements Dijkstra, A*, risk-weighted A* and shaped Q-learning; `backend/utils/grid.py` provides grid costs and route metrics.
- `backend/utils/models.py` validates scenario and result data. `backend/utils/request_security.py` applies rate limits and operator-key checks to server writes.
- `backend/utils/crowd_detector.py` analyzes uploaded images or sampled video frames with YOLO person detection and an OpenCV HOG fallback. The browser maps counts to manually defined camera coverage cells and recalculates routes using the same scenario grid.
- `backend/data/` stores built-in scenarios and experiment output. Optional Q-table persistence is disabled by default and capped when enabled ([backend/.env.example](backend/.env.example)).
- `docs/` holds research scope, audit notes, the Stage D plan and demo evidence; `drafts/`, `proposals/`, and `scripts/` hold article and document work.

## Run, test, deploy

Commands below are documented, not run or verified in this documentation pass.

Local backend, from the repo root:

```bash
cd backend
uvicorn main:app --reload --port 8001
```

Local frontend, in another terminal:

```bash
cd frontend
npm run dev
```

The guides also document backend smoke/unit/API safety and vision checks, the experiment harness, and frontend tests/build. These commands are shown in [README.md](README.md); they are listed here for reference and were not run:

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

The VPS guide documents manual Nginx/systemd setup; [deploy.sh](deploy.sh) runs the update/install/build/restart flow on its configured target. Neither deployment procedure was run here. No tests, builds, installs, servers, browsers or network checks were run for this documentation task.

## Status

### Live (verified)

- 2026-11-09 08:44 MYT: runtime checkout `~/server-runtime/projects/cbcd` fast-forwarded to `f516bc7` and the frontend dist rebuilt from it is live; `/`, `/floor`, the new bundle and `/api/health` returned 200 (checks 2026-11-09). Backend source unchanged since `46ef465`. Same day: nginx `.mjs` MIME fixed and `vision_samples/` copied to the runtime; a PDF floor plan rendered in Chrome (pdf.js 6.4). `vision_samples/` is gitignored, so a fresh runtime checkout needs it copied again.
- On 2026-10-24, Claude's facts recorded the local runtime container as running with source at `~/server-runtime/projects/cbcd`, revision `46ef465`, branch `main`. The same facts record an HTTPS 200 response from the public URL at 08:34 MYT. These observations do not establish that current HEAD `164f52b` is deployed or that routes, camera processing, or write flows work live (facts 2026-10-24).

### Built, not verified live

- Source implements grid editing, multiple exits, configurable weights, Dijkstra/A*/Weighted A*/Q-learning comparisons, route overlays, scenario JSON, result CSV download, and experiment generation ([README.md](README.md), [frontend/src/main.jsx](frontend/src/main.jsx), [backend/main.py](backend/main.py), [backend/algorithms/pathfinding.py](backend/algorithms/pathfinding.py)).
- Source implements image/PDF floor-plan overlays and manual grid tracing ([frontend/src/main.jsx](frontend/src/main.jsx)).
- Source implements image/video upload detection, camera coverage mapping, density-to-crowd updates and route recalculation ([docs/stage_d_iphone_computer_vision_plan.md](docs/stage_d_iphone_computer_vision_plan.md), [backend/utils/crowd_detector.py](backend/utils/crowd_detector.py), [frontend/src/visionMapping.js](frontend/src/visionMapping.js)).
- `docs/stage_d_demo_evidence.md` records a 2026-06-26 S7 sample-video demonstration and route comparison. It is historical project evidence, not a fresh verification of this checkout or the live runtime.
- Existing `backend/data/experiment_logs.csv` and accessibility report are research artifacts. The article plan reports 72 rows and the Lighthouse summary records 95/100; neither was recalculated during this pass ([docs/phase1_summary_scopus_article_plan.md](docs/phase1_summary_scopus_article_plan.md), [docs/lighthouse-accessibility-summary.md](docs/lighthouse-accessibility-summary.md)).

### In progress

- Nothing is reported in progress on a non-default branch: the supplied GitHub facts show `main` aligned with `origin/main`, and local `git branch -a` lists only `main` and its remote tracking ref (facts 2026-10-24; `git branch`). No open pull requests were listed (facts 2026-10-24).

### Planned / backlog

- `to-do.md` leaves RO4/RO5 accuracy and usability evaluation, full-system evaluation and academic writing tasks unchecked. It also labels Phase 2 as parked. The newer Stage D plan says upload-based image/video detection and crowd mapping are implemented; reconcile the checklist with that source and dated demo evidence before planning from its unchecked boxes ([to-do.md](to-do.md), [docs/stage_d_iphone_computer_vision_plan.md](docs/stage_d_iphone_computer_vision_plan.md), [docs/stage_d_demo_evidence.md](docs/stage_d_demo_evidence.md)).
- Future work described in the Stage D plan includes live camera/Continuity Camera demonstration and a native iPhone app. The plan also notes that dense scenes may need a specialized crowd-counting model ([docs/stage_d_iphone_computer_vision_plan.md](docs/stage_d_iphone_computer_vision_plan.md)).

### Known issues and unknowns

- Resolved 2026-11-09: the runtime now runs `f516bc7` (see Live). Earlier, runtime `46ef465` lagged repo HEAD.
- The camera sample buttons request `/vision_samples/ultralytics_bus_people.jpg` and `/vision_samples/big_city_life_people.webm`, but `frontend/public/vision_samples/` is absent from the inspected checkout; `.gitignore` excludes that directory. Those sample buttons may fail here until the files are supplied ([frontend/src/main.jsx](frontend/src/main.jsx), [.gitignore](.gitignore)).
- YOLO person detection, manually mapped coverage area, and density thresholds are prototype inputs. They do not establish accurate dense-crowd counting, automatic camera-to-floor-plan calibration, real-time CCTV streaming, or real-world evacuation safety ([docs/stage_d_iphone_computer_vision_plan.md](docs/stage_d_iphone_computer_vision_plan.md), [docs/phase1_academic_notes.md](docs/phase1_academic_notes.md)).
- No tests or builds were run for this documentation task. Source presence and old checklist marks do not establish current passing tests; public HTTPS 200 is not a route or camera flow check.
- Current API health, live route/camera behavior, deployed frontend revision, VPS target configuration, exact runtime dependency versions and academic validation results were not independently checked.

## Decisions and rules

- Keep the research scope as a decision-support prototype, not a certified evacuation system; modeled risk scores and simulations are not real-world safety validation ([docs/phase1_academic_notes.md](docs/phase1_academic_notes.md), [proposal](Two_Phase_Risk_Aware_Navigation_Crowd_Detection_Proposal.md)).
- Use the locked RO1–RO6 / RQ1–RQ6 structure and Design Science Research methodology as the research frame ([docs/ro_rq_lock.md](docs/ro_rq_lock.md), [docs/phase1_academic_notes.md](docs/phase1_academic_notes.md)).
- Keep multiple exits; describe Q-learning as using potential-based reward shaping and do not claim it universally outperforms the other algorithms ([docs/phase1_audit_fix_todo.md](docs/phase1_audit_fix_todo.md), [docs/phase1_summary_scopus_article_plan.md](docs/phase1_summary_scopus_article_plan.md)).
- Preserve the 2026-10-23 decision: separate implemented prototype capabilities from research proposals, paper claims and future phases (old [PROJECT_BRIEF.md](PROJECT_BRIEF.md) snapshot; retained in this rewrite).
- Existing project rules remain authoritative. This brief does not grant deployment, migration, deletion or messaging permission ([AGENTS.md](AGENTS.md)).

## Read next

- [AGENTS.md](AGENTS.md) and [CHANGELOG.md](CHANGELOG.md)
- [README.md](README.md), [to-do.md](to-do.md), and [proposal](Two_Phase_Risk_Aware_Navigation_Crowd_Detection_Proposal.md)
- [docs/ro_rq_lock.md](docs/ro_rq_lock.md), [docs/codex_fast_context.md](docs/codex_fast_context.md), and [docs/risk_factor_definition_table.md](docs/risk_factor_definition_table.md)
- [docs/stage_d_iphone_computer_vision_plan.md](docs/stage_d_iphone_computer_vision_plan.md) and [docs/stage_d_demo_evidence.md](docs/stage_d_demo_evidence.md)
- [docs/phase1_summary_scopus_article_plan.md](docs/phase1_summary_scopus_article_plan.md), [docs/phase1_code_audit.md](docs/phase1_code_audit.md), and [LOCAL_TESTING.md](LOCAL_TESTING.md)
- [DEPLOY_VPS.md](DEPLOY_VPS.md) and [deploy.sh](deploy.sh) before any deployment work

## Keeping this brief current

Before answering, compare this snapshot with current Git, source and runtime. If they disagree, say so; don't repeat a stale note as fact. After authorized work: add a CHANGELOG.md entry in the same commit, and update the affected facts here with the date and the evidence or checks actually run. Don't keep a competing status summary in any assistant's personal memory.
