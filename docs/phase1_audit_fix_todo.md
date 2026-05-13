# Phase 1 Audit Fix To-Do

Source audit: `docs/phase1_code_audit.md`  
Created: 2026-05-13

Goal: fix thesis-defensibility and demo-quality issues before collecting final Chapter 4/5 experiment evidence.

---

## A. Must fix before final experiments

- [x] A1. Decouple cost-model `alpha` from Weighted A* heuristic inflation.
  - Decision: keep cost-model `alpha` as distance weight only.
  - Add separate `heuristic_weight` with default `1.0`.

- [x] A2. Rework `exit_access` so it does not distort per-step cost and algorithm comparison.
  - Decision: keep multiple exits.
  - Move exit-access from per-step additive cost to a reported path-level metric / selected-exit explanation where practical.

- [x] A3. Make Q-learning effort metric honest.
  - Decision: stop treating training steps as normal search nodes.
  - Expose `train_steps` / explanation, and make UI label clear.

- [x] A4. Preserve Q-learning shaping honesty.
  - Decision: keep potential-based reward shaping because it helps convergence.
  - Update explanation/docs to call it “Q-learning with potential-based reward shaping”.

- [x] A5. Avoid silent Q-learning failure.
  - Decision: return explanation/reason when greedy reconstruction fails.

- [x] A6. Prevent invalid Start fallback to `[0,0]`.
  - Decision: when painting over Start, relocate to nearest empty cell or refuse safely.

- [x] A7. Add run-time validation before algorithm execution.
  - Require valid Start.
  - Require at least one Exit.
  - Require Start/Exit cells are in bounds and passable.

---

## B. High-value UI / demo polish

- [x] B1. Fix replay animation trigger so replay reliably restarts.
- [x] B2. Improve comparison table readability.
  - Right-align numeric columns.
  - Stronger winning row highlight.
  - Add delta vs Dijkstra where useful.
- [x] B3. Improve error display accessibility with `role="alert"`.
- [x] B4. Make import JSON errors show in the existing error banner.
- [x] B5. Mention reached/selected exit in route result explanation/table if feasible.

---

## C. Keep / not changing now

- [x] C1. Keep multiple exits.
  - Reason: important for confined-environment realism and S4 blocked/alternative exit scenario.
  - Thesis wording should say “route to the most suitable reachable exit”, not only “fixed destination”.

- [x] C2. Keep Q-learning module.
  - Reason: useful as learning-based comparison, even if slower.
  - Must describe it honestly as shaped Q-learning and not claim it outperforms all methods.

- [x] C3. Keep route filter/highlight design for now.
  - Reason: it fixed the dot-overflow issue and is demo-ready.
  - SVG polylines can be future polish.

---

## D. Verification checklist

- [x] D1. Backend smoke test passes.
- [x] D2. Backend unit/script tests pass.
- [x] D3. Frontend build passes.
- [x] D4. Experiment harness re-run after model changes.
- [x] D5. Article/summary docs updated if result interpretation changes.
