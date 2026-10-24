# CBCD — shared project brief

Verified source snapshot: **2026-10-23 21:16 MYT**. This is a dated orientation, not a live health dashboard or full code audit.

## Purpose and project location

Risk-aware indoor navigation and camera-based crowd analysis research prototype, with React/Vite frontend and FastAPI backend.

Source checkout on this Mac: `/Users/123ang/Desktop/Websites/cbcd`. Active branch at inspection: `main`; HEAD: `7edd23572767`. Recheck Git and the actual worktree before answering current-status questions.

## Read next

- [README.md](README.md)
- [to-do.md](to-do.md)
- [docs/codex_fast_context.md](docs/codex_fast_context.md)
- [docs/ro_rq_lock.md](docs/ro_rq_lock.md)
- [LOCAL_TESTING.md](LOCAL_TESTING.md)

Existing AGENTS.md/CLAUDE.md rules and canonical design/monetization documents remain authoritative for policy. This brief does not grant deployment, migration, deletion or messaging permission.

## Implemented source evidence

- [backend/main.py](backend/main.py): API entry point.
- [backend/algorithms](backend/algorithms): Routing/comparison algorithms.
- [frontend/src/visionMapping.js](frontend/src/visionMapping.js): Vision-to-scenario mapping.
- [backend/test_crowd_detector.py](backend/test_crowd_detector.py): Crowd detector test source; not executed in this pass.

These paths were inspected for source presence/structure. No application tests were rerun for this documentation setup; do not describe them as passing now.

## Observed runtime and verification limits

Observed `server-restore-cbcd-api-1` running, with source mounted from `/Users/123ang/server-runtime/projects/cbcd`. This is not proof of public access, camera accuracy or academic validation.

## Planned work, uncertainties and decisions

Separate implemented prototype capabilities from research proposals, paper claims and future phases. Consult the phase task list and locked research scope before recommending next work.

## Keeping this brief current

Before a project answer, compare this snapshot with current Git, relevant source and actual runtime evidence. If they disagree, state the discrepancy; do not repeat a stale note as fact. After authorized project work, update only the affected implemented/planned/runtime facts here, with the date, file/command evidence and checks actually run. Preserve unknowns and mark proposals as proposals. Personal chat memories are historical context, not a substitute for current shared evidence. For status answers, cover implemented source, verified deployment, remaining/planned work and unverified items; give a separate opinion only after those facts.
