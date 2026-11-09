# Changelog — CBCD

What changed in this project, newest first. Claude Code, Codex and OpenClaw all read this file and add to it.

**Adding an entry:** in the same commit as the change, under today's `## YYYY-MM-DD` heading (create it at the top if missing).
One line per change: `- **Type:** what changed and why it matters (`<short hash>`; <branch if not default>; <who: user / Claude / Codex / OpenClaw>)`.
Types: Added, Changed, Fixed, Removed, Security, Deployed, Decision, Docs.
`Deployed` names the target and the evidence. `Decision` attributes it to the user. Don't record tests as passing unless they were run; write "checks: <what ran>".

## In progress (not on `main`)

Nothing in progress.

## 2026-11-09

- **Fixed:** runtime only, outside the repo: gateway nginx (`~/server-runtime/nginx/restored.conf`, CBCD block) now serves `.mjs` as `text/javascript` (was `application/octet-stream`), and `vision_samples/` (bus jpg + webm, gitignored) copied from the dev checkout into the runtime `frontend/public/` and `frontend/dist/`. Backup `restored.conf.bak-2026-11-09`; `nginx -t` passed, graceful reload. checks: worker content-type `text/javascript`; Chrome upload of a test PDF on /floor rendered page 1 of 1 with pdf.js 6.4; webm 200 video/webm; jpg 200 image/jpeg at the origin (Cloudflare edge held a cached HTML fallback, max-age 4h). Other gateway sites still 200 after reload (Claude; user-approved).
- **Deployed:** frontend `f516bc7` (pdf.js 5.7 → 6.4 RCE advisory fix, pinned deps) to cbcd.suntzutechnologies.com at 08:44 MYT: runtime checkout fast-forwarded 46ef465 → f516bc7, prebuilt dist swapped in (backend unchanged, API container not restarted); backup + rollback in `~/server-runtime/rollback/cbcd-dist-20261109-084429/`. checks: staged `npm ci` + `vite build`, `npm test` 5/5, `npm audit --omit=dev` 5 high → 0, live `/`, `/floor`, new JS bundle and `/api/health` 200. Not checked: PDF upload in a browser (live nginx serves `.mjs` as `application/octet-stream`, likely breaking the pdf.js module worker; pre-existing) and vision sample buttons (`frontend/public/vision_samples/` gitignored, missing on the server; pre-existing) (Claude; user-approved; staged by an Opus subagent).

## 2026-10-24

- **Docs:** Added this changelog and rewrote the project brief from the current repository and `facts 2026-10-24`; recorded the stale brief revision and the mismatch between the Phase 2 checklist and Stage D source/docs (uncommitted; by Codex using Claude-collected facts; no tests, builds, installs, or runtime checks run).
- **Docs:** Added shared agent instructions and a dated project brief so Claude Code, Codex and OpenClaw use the same project context (`164f52b`; `main`; user, co-authored by Claude).

## 2026-10-12

- **Security:** Pinned frontend dependency ranges, updated `pdfjs-dist` and its PDF render cleanup, and stopped tracking the local frontend environment file (`7edd235`).

## 2026-09-12

- **Changed:** Adjusted backend dependency constraints and made optional vision imports safer when the local OpenCV/NumPy build is unsupported (`7708adc`, `04a8c82`, `46ef465`).

## 2026-08 (summary)

- **Added:** Added Stage D sample evidence for YOLO camera coverage, video detections and route comparison, plus the project summary document and its generator (`e7dde68`).
- **Docs:** Expanded the fast context with the Stage D evidence and added a plain-language route-planner summary (`e7dde68`).

## 2026-06 (summary)

- **Added:** Added camera crowd upload and YOLO/HOG detection, camera coverage mapping, crowd-to-grid updates, the Stage D plan, and the S7 demo scenario (`6cc9e1d`).
- **Security:** Added API rate limits, operator-key protection for server writes, upload controls, and result-export support; documented the VPS setup (`32dc41e`).

## 2026-05 (summary)

- **Added:** Started the React/Vite and FastAPI prototype, grid pathfinding, S1–S6 scenarios, experiment output, proposal, and initial local/deployment guides (`ba4f819`).
- **Docs:** Added the Phase 1 code audit and expanded deployment automation and instructions (`42e635d`, `429685b`).
- **Changed:** Added the floor-plan overlay workflow, updated the dashboard and experiment output, and expanded local testing instructions (`136ee77`).
- **Docs:** Added the article literature and writing materials and established the preferred practical, framework-led paper framing (`c8eb130`).
- **Docs:** Added the filtered GRA literature review and updated the article source/build materials (`394e8d9`, `1021a5c`).
