# Money on the Table (web app)

Family caregivers photograph the paperwork they already have. The app reads four facts on the device, the caregiver confirms each one, a dated rules table finds likely programs, and the app pre-fills the applications. What only a person can do (sign, a free SHIP counselor review, find a GUIDE provider) becomes tasks the family claims.

```
npm install
npm run dev       # http://localhost:5173
npm test          # unit tests (rules, parsers, redaction, drafts, tasks, entities)
npm run build
npm run screens   # Playwright screenshots + two-tab flow test (needs a build)
```

## Demo (2 minutes)

1. Open the landing page, then **Try it with the sample family**.
2. **Read my documents**: watch the reader highlight each fact on the sample paperwork.
3. Confirm the four facts, then **Save and find programs**: about $8,100/yr (estimate).
4. **Open draft**: the Medicare Savings Program form, pre-filled, with the SSN and Medicare number left for you to fill in by hand.
5. **Plan**: copy the family link, open it in a second tab, pick Daniel, claim a task. It shows up on Grace's tab instantly.

## How the "AI" works without an API key

| Mode | When | How |
|---|---|---|
| Sample | "Use sample" tiles | Built-in fake documents with known field positions. Never fails on stage |
| On-device OCR | Real photos | tesseract.js, self-hosted in `public/ocr/` (copied by `scripts/copy-ocr-assets.mjs`), loaded only when a photo is picked. Parsers in `src/features/reading/parsers/` turn text into facts; `redact.ts` masks SSN, Medicare and account numbers |
| Manual | Skipped or unreadable docs | The caregiver types the value |
| Base44 | When hosted on Base44 | `base44Provider.ts` is the seam for Base44's built-in AI file extraction |

## Layout

- `src/contracts.ts`: shared types
- `src/data/`: entities (localStorage + BroadcastChannel, same shape as the Base44 SDK), session (per-tab identity; photos kept in memory only), seed, actions, tasks
- `src/rules/`: `rules2026.ts` (Washington 2026 limits with sources and dates) and `engine.ts`
- `src/features/`: `docs`, `reading`, `programs` (cards, drafts), `plan` (tasks, pipeline, invite)
- `src/pages/`: one file per route (HashRouter)

## Guardrails

- Photos never leave the browser tab and are cleared once the facts are confirmed.
- The app never extracts or stores SSNs, Medicare numbers or account numbers.
- Every match reads "likely, confirm with a free counselor"; the rules date is shown on screen.
- The app never signs or submits anything.
