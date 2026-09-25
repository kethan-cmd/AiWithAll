# AI with All Hackathon

One-day hackathon. We're building a Base44 app (React frontend, Base44 entities and backend functions, Base44 SDK). Time is the main constraint: working and demoable beats complete.

Setup steps live in the comp-day guides in this folder. Follow them instead of improvising.

## How we work with Base44

- **Direct (MCP):** edits go straight to the app sandbox and show up in the preview immediately.
- **GitHub sync:** only `main` syncs to Base44. Work on a branch per feature, merge to `main`, then Publish in Base44.
- Before any risky or multi-file change, create a Base44 checkpoint.

## Rules

- **Plan before building.** For anything beyond a small fix, state the plan (files touched, approach) in a few lines and wait for approval.
- **Stay in scope.** Change only what the task needs. Never refactor, rename, or restructure Base44's generated files or folder layout.
- **Work within Base44 patterns.** Use Base44 entities for data and the Base44 SDK for backend calls. Don't add external services or packages unless asked.
- **Read narrowly.** Open only the files relevant to the task. Use a subagent for broad searches.
- **One feature per branch or session.** Keep features in separate files so parallel work doesn't conflict.
- **Verify every change.** After editing, say exactly what to click or check in the preview to confirm it works.
- **Fail fast.** If the same approach fails twice, stop and report: what you tried, the exact error, and your best next option.
- **No surprises.** Never delete data, change entity schemas, or touch auth without asking first.

## Reporting

After each task, reply briefly with:
1. What changed (files and one line each)
2. How to test it
3. Any risks or follow-ups
