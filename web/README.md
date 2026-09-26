# Last Slot (prototype)

React + React Router + Vite + Tailwind + shadcn/ui. No backend: data lives in
localStorage and syncs live across browser tabs with BroadcastChannel.

```
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest: grid logic, splitTasks, data layer
npm run build
```

## Layout

- `src/data/` entity API (`entities.ts`), models, seed data, claim/verify actions, per-tab session
- `src/logic/` `grid.ts` (30-min cells, free runs, blockers, metrics), `splitTasks.ts` (mock AI)
- `src/pages/` one file per screen; `src/components/` shared UI

To swap in a real backend, keep the `EntityApi` shape in `entities.ts` and replace its internals.
To swap in a real AI, replace the marked spot in `splitTasks.ts` (`REAL AI CALL GOES HERE`).

## Demo script (open 3 tabs)

1. Tab A: Home > Caregiver > "Open Sunflower" (Rest Grid, Sat 1-4pm, LAST SLOT on groceries).
2. Tab B: Home > Family. Claim a hands-on task (family-only tasks are only here).
3. Tab C: Home > Student. The Last Slot task is at the top. Claim it.
4. Tab A flips to "Saturday 1-4pm is yours" with confetti.
5. Open `/board` on the projector: windows unlocked, hours returned, team leaderboard.
6. Home > Chaperone: tap Verify on claimed tasks.
7. "Reset demo" (top right) restores the seeded state.

Each tab has its own role (stored in sessionStorage); the data is shared.
