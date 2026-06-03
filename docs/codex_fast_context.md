# Codex Fast Context

Read this first before working on the proposal, article draft, or prototype.

## Core Understanding

The project is about safer movement in confined indoor environments. The strongest version is a decision-support prototype that recommends routes by considering not only distance, but also risk zones, obstacles, blocked exits, crowd density, and route explainability.

The main research contribution should be the integration pipeline:

`sensing / scenario input -> risk scoring -> route-cost model -> algorithm comparison -> explainable safer route recommendation`

The most defensible project identity is:

**A risk-aware indoor navigation decision-support prototype that integrates spatial risk, crowd density, and algorithm comparison to recommend safer routes in confined environments.**

## Current Document Situation

There are two related but slightly different project directions in the materials:

1. **Focused two-phase direction**
   - Simulation-based 2D risk-aware indoor navigation.
   - Camera / YOLO crowd detection.
   - Crowd level converted into crowd-risk score.
   - Route model updates and recalculates safer route.
   - Compares Dijkstra, A*, Weighted A*, and Q-learning / RL.
   - This is the clearest, most buildable, and most publishable direction.

2. **Broader PRGS / PhD Chapter 1 direction**
   - LiDAR / SLAM, real-time movement forecasting, spatial manipulation, SDSOS / ASNA.
   - Human perception, comfort, emotion, stress, cognition, biometric or affective inputs.
   - Interesting, but currently too broad unless tightly scoped.
   - Risk: it sounds like "AI for everything in confined spaces" rather than one coherent artifact.

The current canonical Stage 1 article draft is now:

- `drafts/vision_assisted_risk_aware_framework_article.md`
- `drafts/vision_assisted_risk_aware_framework_article.docx`
- `drafts/vision_assisted_risk_aware_framework_article.tex`

Use the wording **vision-assisted** rather than **camera-assisted** in the article title/framing. This keeps the framework open to CCTV, smartphone camera input, depth cameras, LiDAR-enabled devices, and future vision-based density-estimation methods.

2026-05-18 document update:
- The article now uses a real grayscale framework figure instead of a Mermaid/code flowchart.
- Figure file: `docs/assets/vision_assisted_framework_architecture.png`
- The DOCX was regenerated in a plain journal-manuscript style: A4 page, 1-inch margins, Times New Roman 12 pt body, black headings, justified body text, simple tables, and one inserted Figure 1.
- DOCX structural/a11y checks passed with 0 high/medium/low issues.
- LibreOffice/`soffice` and Poppler were installed via Homebrew on 2026-05-18; DOCX visual render QA now works when run outside the sandbox with `TMPDIR=/private/tmp`.
- Current article author/affiliation block: Nazrul Anwar Bin Ramli, Jastini Mohd Jamil, Izwan Nizal Mohd Shaharanee, Ang Jin Sheng; `Department of Decision Science, School of Quantitative Sciences, Universiti Utara Malaysia, Sintok, Malaysia`.
- The introduction no longer uses numbered "Objectives" or "Research questions" lists. It now uses a Scopus-style prose paragraph beginning "To address this problem..." that states the review, design requirements, framework focus, scenario walkthroughs, and future validation plan.
- Table 2 now cites each literature stream directly in the first column, e.g. indoor navigation (Łukasik et al., 2024), fire evacuation routing (Kim et al., 2026; Zhou et al., 2020; Mocanu et al., 2026), risk-aware path planning, crowd detection, density estimation, indoor positioning, decision support, and the proposed framework.
- Crowd-density formula and Table 1 support now cite pedestrian LOS / crowd-dynamics / density-risk literature in prose and caption: Fruin (1971), Helbing & Johansson (2013), and Yin et al. (2019). Table 1 should be described as synthesized/adapted, not as a new standard written by the article authors.
- Section 4.1 Framework Overview uses prose rather than a numbered list. This prevents Word from continuing the methodology list numbering as 12, 13, 14, etc.
- Formula lines in the DOCX are centered, italic, Cambria Math-style equation text instead of code blocks. Native Word equation OOXML was tested but rejected because the renderer converted "in zone" into a mathematical element-of symbol.
- On 2026-05-21, framework-only wording was tightened: removed Stage 1 / iPhone / prototype framing from the article body, paraphrased indoor positioning as a supporting framework layer, changed "opaque" sentence to simpler wording, and fixed DOCX occurrences where `A*` had rendered as plain `A`.
- Tone direction: keep it practical, framework-driven, and closer to the `docs/ang_article_writing_style_notes.md` voice; avoid overly polished AI-style phrasing.

2026-05-22 LaTeX/DOCX workflow update:
- Pandoc 3.9.0.2 was installed via Homebrew and is used for reproducible article builds.
- `scripts/build_article_from_latex.sh` now regenerates both `drafts/vision_assisted_risk_aware_framework_article.tex` and the canonical DOCX from the Markdown manuscript. The DOCX path intentionally builds from Markdown with LaTeX equations because direct LaTeX `longtable` -> DOCX conversion corrupted wide tables in LibreOffice rendering.
- `scripts/polish_latex_docx.py` applies A4, 1-inch margins, Times New Roman, black headings/body text, table cleanup, known table-value repair, and Word table geometry.
- The canonical DOCX now contains real Word equation objects for the formulas (`m:oMath` and `m:f` present in `word/document.xml`) while preserving readable journal-style tables.
- Latest checks run after rebuild: DOCX zip test passed, accessibility audit reported `high=0 medium=0 low=0`, and LibreOffice render QA was visually checked for the title page, formula page, and Table 1 page.

## Recommended Framing

Use the two-phase proposal as the anchor.

Phase 1:
- Build a 2D indoor navigation simulator.
- Include walls, obstacles, risk zones, exits, and crowd-density zones.
- Compare shortest-path routing with risk-aware routing.
- Weighted A* is likely the most explainable main route-cost method.
- Q-learning can be included as an intelligent comparison method, but should not be overclaimed as always better.

Phase 2:
- Add camera / video crowd detection using pretrained YOLO.
- Detect/count people.
- Convert crowd level into a crowd-risk score.
- Feed that score into the navigation model.
- Demonstrate route recalculation when a corridor becomes crowded.

## Best Research Claim

Do not claim the novelty is simply "crowd detection" or "shortest path." Those are common.

The stronger claim is:

**The prototype links crowd sensing and spatial risk scoring directly to route recommendation and explains why a safer route is selected over a shorter route.**

## Literature Folder Mapping

Use the article PDFs like this:

- **Design Science Methodology**
  - `design_science_information_systems_research_hevner.pdf`
  - `design_science_research_methodology_peffers.pdf`
  - Supports DSRM: artifact design, development, demonstration, evaluation.

- **Routing / Evacuation / Dynamic Risk**
  - `algorithmic_evaluation_fire_evacuation_dynamic_crowd_smoke.pdf`
  - `three_dimensional_indoor_fire_evacuation_routing.pdf`
  - `dynamic_risk_perception_metro_fire.pdf`
  - Supports the argument that shortest path is not enough when smoke, congestion, risk, or dynamic hazards exist.

- **Crowd Detection / Counting**
  - `crowd_detection_yolo_human_recognition.pdf`
  - `dense_stream_yolov8n_smart_libraries.pdf`
  - `survey_deep_learning_density_estimation_crowd_counting.pdf`
  - Supports YOLO/crowd-counting module and limitations around occlusion, density, camera angle, real-time accuracy.

- **Human Behavior / Evacuation Simulation**
  - `agent_based_simulation_pedestrian_evacuation_slr.pdf`
  - `helbing_2000_escape_panic_arxiv.pdf`
  - `helbing_johansson_2013_pedestrian_crowd_evacuation_dynamics_arxiv.pdf`
  - `haghani_ronchi_2024_revisiting_escape_panic_arxiv.pdf`
  - `lopez_carmona_2021_cellevac_adaptive_crowd_evacuation.pdf`
  - Supports behavior, crowd dynamics, validation issues, and why simplistic routing assumptions are weak.

- **Crowd Density / Safety Thresholds**
  - `yin_2019_highly_aggregated_tourist_crowd_accidents_plosone.pdf`
  - Supports density-based crowd-risk scoring and threshold discussion.

- **Indoor Localization**
  - `multimodal_image_based_indoor_localization_ml_review.pdf`
  - Useful if discussing indoor positioning/localization, but not central unless the project expands beyond simulation.

- **Systematic Review Method**
  - `prisma_2020_statement.pdf`
  - Use only if writing a formal systematic literature review section.

For quick answers to recurring article questions about crowd thresholds, density calculation, people counting methods, evacuation sensor inputs, and the dynamic crowd/smoke algorithm paper, read `docs/article_qna_fast_context.md`.

## Incoming GRA Syafiq Bundle

On 2026-05-25, two incoming root files were reviewed and ignored in git:

- `Literature Review - Matrix 20260524.xlsx`
- `1. GRA - Syafiq [Shared]-20260525T122622Z-3-001.zip`

The ZIP was extracted to `incoming/gra_syafiq_shared_20260525/`. The root XLSX is identical to the extracted `1. Literature Review/Literature Review - Matrix 20260524.xlsx`.

Read `docs/incoming_gra_syafiq_review_20260525.md` for the filtered summary. Key point: the workbook is useful but much broader than the current focused article/prototype. Use only the papers directly tied to indoor evacuation, risk-aware routing, crowd density/detection, decision support, design science, and supporting indoor positioning. Treat emotion/EEG/wearables, broad RL algorithms, robot-only navigation, smart-city-scale flow, GRA registration, patent templates, and grant-admin files as unrelated or low priority for the current work.

## Main Risks / Fixes

- Pick one primary sensing direction: camera/YOLO or LiDAR/SLAM.
- If both appear, make one primary and put the other as future work.
- Reduce broad generic AI background in Chapter 1.
- Align title, objectives, RQs, methodology, prototype outputs, and evaluation metrics across all documents.
- Avoid privacy-preserving claims if facial/emotion recognition remains in scope.
- Check factual claims, especially Tesla/LiDAR and any invented or weak citations.
- Clean language:
  - "An Intelligent App", not "Apps".
  - "reinforcement learning", not "reinforced learning".
  - "theoretical", not "theoritical".
  - Keep student ID consistent.

## Preferred Objective / RQ Shape

RO1/RQ1: Identify spatial and environmental risk factors for confined indoor navigation.

RO2/RQ2: Develop a 2D risk-aware navigation model using distance, obstacles, risk zones, crowd density, and exit accessibility.

RO3/RQ3: Compare Dijkstra, A*, Weighted A*, and Q-learning / RL under the same scenarios.

RO4/RQ4: Develop a YOLO-based crowd detection/counting module.

RO5/RQ5: Convert detected crowd levels into route risk scores.

RO6/RQ6: Evaluate whether the integrated system improves route safety, reduces risk/crowd exposure, and provides explainable decisions compared with distance-based routing.

## Evaluation Metrics

Use measurable metrics:

- Route distance.
- Risk exposure score.
- Crowd exposure score.
- Total route cost.
- Computation time.
- Route success rate.
- Risk reduction percentage vs Dijkstra shortest path.
- Crowd classification accuracy vs manual count.
- Expert/user usability for dashboard clarity.
- Decision explainability.

## One-Line Direction

Keep the project narrow enough to build and evaluate: **risk-aware route recommendation with crowd-aware updates**, not a universal AI human-behavior platform.

## Standing Prototype Memory Rule

For future prototype work, read this file first. When the prototype code, scope, tests, routes, metrics, scenarios, or run commands change, update this file in the same turn so the project memory stays current.

## Prototype Code Context

Current prototype status: **Phase 1 plus Stage A-C planning polish is implemented as a React + FastAPI risk-aware indoor navigation dashboard. Phase 2 / YOLO is intentionally parked behind a stub.**

Primary source files:

- `backend/main.py`: FastAPI app, CORS, route endpoints, scenario load/save, experiment CSV export, Phase 2 crowd stub.
- `backend/algorithms/pathfinding.py`: Dijkstra, A*, Weighted A*, and Q-learning implementation.
- `backend/utils/grid.py`: cell typing, passability, neighbors, cell-cost model, path metrics, route reconstruction.
- `backend/utils/models.py`: Pydantic request/response schemas and cost weights.
- `backend/data/scenarios.json`: six built-in thesis/demo scenarios S1-S6.
- `backend/run_experiments.py`: runs all scenarios across Default, Distance-heavy, and Safety-heavy presets into `backend/data/experiment_logs.csv`.
- `backend/tests.py`: backend scenario assertions for all algorithms and risk-detour behavior.
- `backend/smoke_test.py`: quick S2 risk-path verification.
- `frontend/src/main.jsx`: the whole React dashboard UI and interaction logic.
- `frontend/src/api/navigationApi.js`: API base and endpoint wrappers.
- `frontend/src/styles.css`: dashboard styling.
- `frontend/public/sample_floorplan_wikimedia.jpg`: bundled public-domain Wikimedia floor-plan image for manual overlay testing.
- `docs/assets/sample_floorplan_wikimedia.jpg`: same sample floor-plan asset kept with documentation.
- `LOCAL_TESTING.md`: local run/test/demo guide.
- `README.md`: high-level project and feature summary.

## Backend Behavior

FastAPI runs as **CBCD Phase 1 Risk-Aware Navigation API**.

Endpoints:

- `GET /health`
- `POST /run-dijkstra`
- `POST /run-astar`
- `POST /run-weighted-astar`
- `POST /run-qlearning`
- `POST /compare-algorithms`
- `POST /compare-selected`
- `GET /load-scenario`
- `POST /save-scenario`
- `POST /export-results`
- `POST /camera/crowd`

`/camera/crowd` accepts multipart image/video upload under `media` and runs the Stage D detector prototype. It now uses Ultralytics `yolov8n.pt` as the primary person detector and falls back to OpenCV HOG if YOLO is unavailable in `auto` mode. It returns media type, model name, image/frame dimensions, people count from the peak frame, average people count, confidence average, bounding boxes, frame summaries, and a preview image data URL. Set `CBCD_DETECTOR_BACKEND=yolo` to force YOLO, `hog` to force HOG, or `auto` for YOLO-primary fallback behavior.

## Data Model

`ScenarioRequest` shape:

- `name`
- `grid`: 2D list of cell objects.
- `start`: `[row, col]`.
- `exits`: list of `[row, col]`.
- `weights`: `alpha`, `beta`, `gamma`, `delta`, `epsilon`, `heuristic_weight`.
- `metadata`.

Cell types:

- `empty`
- `wall`
- `blocked`
- `risk`
- `crowd`

Blocking cell types are `wall` and `blocked`. Risk and crowd cells carry `intensity`, normally 1-3.

`RouteResult` includes:

- `algorithm`, `success`, `path`, `distance`, `risk_score`, `crowd_score`, `total_cost`, `time_ms`, `nodes_expanded`, `weights`, `reached_exit`, `train_steps`, `exit_access_score`, `delta_distance_vs_dijkstra`, `delta_risk_vs_dijkstra`, `risk_reduction_pct`, `crowd_reduction_pct`, `explanation`.

## Cost Model

Implemented per movement step in `cell_cost`:

`total_step_cost = alpha * 1 + beta * crowd + gamma * risk + delta * blockage`

Important nuance: `epsilon` is kept for thesis terminology and exported in weights, but exit access is **reported separately** by `path_metrics` as `exit_access_score`. It is not added per step because that overlaps with the A* heuristic and makes baseline comparison harder to defend.

Weighted A* uses the weighted cell cost plus Manhattan heuristic. `heuristic_weight` is separate from `alpha`.

## Algorithms

Dijkstra:

- Uses `_search` with uniform step cost and no heuristic.
- Baseline shortest-path method.

A*:

- Uses `_search` with uniform step cost and Manhattan heuristic.
- Baseline efficient shortest-path method.

Weighted A*:

- Uses `_search` with risk/crowd/blockage weighted step cost and Manhattan heuristic.
- This is the main explainable risk-aware method.

Q-learning:

- Deterministic random seed from scenario hash.
- Actions: up, down, left, right.
- Rewards: exit +100, invalid wall/blockage -100, risk penalty, crowd penalty, step penalty, plus potential shaping toward nearest exit.
- Episodes: between 900 and 2600 depending on grid size.
- Saves Q-table JSON to `backend/data/q_tables/{scenario_hash}.json`.
- Can be slower than graph search; use as intelligent comparison, not as the guaranteed best method.

## Built-In Scenarios

`backend/data/scenarios.json` contains:

- S1 Normal layout: 20x30, small wall set, single exit.
- S2 Risk zone on shortest path: 20x30, 42 risk cells, used for risk-detour assertion.
- S3 Crowded main corridor: 20x30, walls plus 20 crowd cells.
- S4 Blocked exit: 20x30, two exits, blocked cells near one route.
- S5 Dynamic crowd update: 20x30, 10 crowd cells, simulates crowd update concept without YOLO.
- S6 Algorithm comparison sweep: 20x30, two exits, mix of wall/risk/crowd cells.
- S7 YOLO camera crowd update: 20x30 corridor demo with camera-derived critical crowd cells on the shortest route; Dijkstra/A* use the crowded short route, while Weighted A* takes a longer no-crowd detour.

## Frontend Behavior

The React dashboard is in a single main file and supports:

- Top-level tabs for Scenario Builder, Floor Plan Planning, and Camera Vision.
- Grid map editing with tools: Empty, Wall, Start, Exit, Risk, Crowd, Blocked.
- Risk/crowd intensity slider.
- Start and exit dragging.
- Multiple exits.
- Right-click erase.
- Undo/redo with last 50 actions.
- Grid resize and presets with 80x80 cap.
- Random walls, recursive division, risk corridor, and hotspot generators.
- Built-in scenario loading from backend.
- Algorithm selection and visibility toggles.
- Run selected and run all.
- Route overlay filtering and replay animation.
- Weight presets: Default, Distance-heavy, Safety-heavy.
- Weight sliders for `alpha`, `beta`, `gamma`, `delta`, `epsilon`, and `heuristic_weight`.
- Scenario JSON import/export.
- CSV result export through backend.
- Sortable comparison table.
- Comparison evidence fields for delta distance/risk vs Dijkstra and risk/crowd reduction percentages.
- Recommendation panel based on lowest `total_cost`, with shortest-route and safer-route explanation text.
- Manual floor-plan planning overlay: PNG/JPG upload, PDF rendering with `pdfjs-dist`, sample floor-plan loader, opacity, fit mode, clear/reset controls, and scenario metadata preservation under `metadata.floor_plan`.
- Stage D Camera Vision workflow: camera labels, source type selection, camera marker on the coverage map, clickable grid coverage cells, coverage percentage, per-cell real-world area, sample photo/video buttons, iPhone/CCTV photo or short-video upload, detector preview with bounding boxes, density calculation, crowd-level mapping, and vision-derived crowd-cell application to the route grid.

Default frontend API base is `http://localhost:8001`, unless `VITE_API_BASE` is set.

Floor-plan metadata shape:

- `metadata.floor_plan.source_type`: `image` or `pdf`.
- `metadata.floor_plan.name`: original or sample file name.
- `metadata.floor_plan.rendered_image_data_url`: image data used as the grid underlay.
- `metadata.floor_plan.pdf_page` and `pdf_page_count` for PDFs.
- `metadata.floor_plan.opacity`, `fit_mode`, `rendered_width`, `rendered_height`, optional `source_url`.

Vision metadata shape:

- `metadata.vision_input.cameras[]`: camera labels with `id`, `name`, `source_type`, `coverage_cells`, `cell_area_m2`, optional `notes`, and `last_analysis`.
- `metadata.vision_input.last_analysis`: latest detector result, including `people_count`, `average_people_count`, `detections`, `density`, `coverage_area_m2`, `crowd_level`, `crowd_intensity`, `model`, `media_type`, and `preview_image_data_url`.
- Vision-applied grid cells are stored as normal `crowd` cells with extra `source: "vision"` and `camera_id`; pathfinding ignores the extra fields and uses the existing crowd intensity.
- Local sample media lives under `frontend/public/vision_samples/` for the app and `incoming/vision_examples/` for local testing; both folders are git-ignored.

## Local Run Commands

Backend:

```bash
cd /Users/123ang/Desktop/Websites/cbcd/backend
source .venv/bin/activate
uvicorn main:app --reload --port 8001
```

Frontend:

```bash
cd /Users/123ang/Desktop/Websites/cbcd/frontend
npm run dev
```

Typical frontend URL: `http://localhost:5173`.

## Verification Commands

Backend:

```bash
cd /Users/123ang/Desktop/Websites/cbcd/backend
PYTHONPATH=. .venv/bin/python tests.py
PYTHONPATH=. .venv/bin/python smoke_test.py
PYTHONPATH=. .venv/bin/python run_experiments.py
```

Frontend:

```bash
cd /Users/123ang/Desktop/Websites/cbcd/frontend
npm test
npm run build
```

Last verification in this context update:

- `PYTHONPATH=. .venv/bin/python tests.py`: passed.
- `npm run build`: passed.

Stage A-C implementation note:

- Added current-status cards to the app.
- Added Dijkstra baseline deltas and reduction percentages to compare/export/experiment flows.
- Added a separate Floor Plan Planning tab for manual route planning over uploaded floor plans.
- Added `pdfjs-dist` dependency for client-side PDF page rendering.
- Downloaded the Wikimedia Commons public-domain `Sample Floorplan.jpg` test asset.

2026-06-02 Stage C verification and Stage D planning:

- Stage C Floor Plan Planning was confirmed present in the current frontend: separate tab, image/PDF upload, sample floor plan loader, opacity, fit mode, clear/reset controls, manual grid tracing over the image, run selected/all, and floor-plan metadata preservation under `metadata.floor_plan`.
- Verification run: backend `tests.py` passed, backend `smoke_test.py` passed, backend `run_experiments.py` wrote 72 rows, and frontend `npm run build` passed. Vite still warns that the PDF worker chunk is over 500 kB, which is expected from `pdfjs-dist`.
- Stage D iPhone computer-vision plan was added at `docs/stage_d_iphone_computer_vision_plan.md`.
- Recommended Stage D path: start with iPhone Safari image/video upload into the existing web app, then map detections to floor-plan grid cells; use Continuity Camera only for a live Mac demo; build a native iOS AVFoundation/Vision/Core ML app only after the web detection pipeline proves the research logic. LiDAR should be treated as optional on supported devices, not assumed for all iPhones.

2026-06-02 Stage D implementation:

- Replaced the `/camera/crowd` stub with a real upload detector endpoint using `opencv-python-headless`, `numpy`, and `python-multipart`.
- Added `backend/utils/crowd_detector.py` for image/video decoding, YOLO/HOG person detection, peak-frame summarization, preview-frame data URL generation, and crowd-density category mapping.
- Added `backend/test_crowd_detector.py`; it verifies density categories, peak-frame summarization, and multipart endpoint upload using a generated blank JPEG.
- Added frontend `Camera Vision` tab and `frontend/src/visionMapping.js`. The tab lets the user add/select cameras, label coverage cells on the floor-plan grid, upload iPhone/CCTV photo or short video, inspect detector boxes/counts, calculate density, apply crowd cells, and rerun existing algorithms.
- Added frontend `npm test` using Node's built-in test runner for density/category and coverage-to-grid mapping.

2026-06-02 YOLO upgrade:

- Installed Ultralytics YOLO dependencies in the backend venv and added `ultralytics>=8.4.0` to `backend/requirements.txt`.
- `backend/utils/crowd_detector.py` now loads `yolov8n.pt` by default, filters detections to COCO person class `0`, and reports `ultralytics-yolov8n.pt-person` when YOLO is used.
- First YOLO smoke test downloaded `backend/yolov8n.pt`; `.gitignore` ignores backend `.pt` model files.
- Added a unit test for YOLO result parsing so non-person classes are ignored.

2026-06-02 Stage D.2 demo polish:

- Copied the downloaded sample photo/video into ignored `frontend/public/vision_samples/` so the Camera Vision tab can load them through normal frontend fetches.
- Added sample photo and sample video buttons to the Camera Vision panel. They call the same `/camera/crowd` endpoint as user uploads.
- Added camera marker and coverage percentage display to the camera coverage map.
- Added `S7 YOLO camera crowd update` to built-in scenarios as the main Stage D evidence scenario.

## Prototype Development Priorities

Keep Phase 1 demo-ready before expanding:

- Preserve the core thesis claim: shortest route is not always safest.
- Keep Weighted A* as the most explainable risk-aware algorithm.
- Keep Q-learning as a comparison method unless improving RL is the explicit task.
- Current Stage D detector is YOLO-primary using Ultralytics `yolov8n.pt`, with HOG fallback. For dense crowd occlusion, YOLO may still undercount; future work can replace or extend it with density-map crowd counting.
- If adding streaming, custom YOLO training, or density-map crowd counting later, keep the same pattern: connect detected crowd count/density into existing `crowd` cell intensities or route-cost weights instead of creating a separate unrelated flow.
- When changing metrics or weights, also update `run_experiments.py`, `RouteResult`, frontend table columns, CSV export fields, and this file.
