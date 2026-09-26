# Base44 Dev Environment

## What this is
**Money on the Table** — a React 19 + Vite 8 + Tailwind 4 frontend for family caregivers of people with dementia. Pure client-side app: no backend, no database, no external API keys. Data lives in localStorage + BroadcastChannel; OCR runs on-device via tesseract.js (assets self-hosted in `public/ocr/`).

## Running it
```
docker compose -f docker-compose.base44.yml up -d
```
- Web entry point on host port **3000** (maps to Vite's 5173).
- `node:22` base image, source bind-mounted at `/app`; `npm install` then `vite --host 0.0.0.0` with live reload.
- `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` (platform-provided) lets the preview origin through Vite's host check.
- No secrets required. No migrations or seeds.

## Key facts
- The app code lives in `app/` (not repo root). All commands run from there.
- `predev` (`scripts/copy-ocr-assets.mjs`) copies tesseract worker/wasm/model from `node_modules` into `public/ocr/` (gitignored). It runs automatically before `dev` and `build`; needs `npm install` first.
- HashRouter is used, so any path serves `index.html` — no server-side routing config needed.
- `archive/` contains earlier prototypes and is not part of the running app.
- Vite config sets `base: './'` so the build works from any folder.

## Verifying
- `curl -s http://localhost:3000/` returns HTML with `/@vite/client` (dev server, not prebuilt).
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/src/main.tsx` → 200 (live source).
- Preview should show the landing page with "Try it with the sample family".
