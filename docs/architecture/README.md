# Architecture docs

Short, code-accurate maps of each area. Read **only the doc for the area you are touching**; each
one lists the files, the data shapes, the invariants and where to make common changes.

| Area                                | Doc                      | Folder                            |
| ----------------------------------- | ------------------------ | --------------------------------- |
| Nonogram engine                     | [engine.md](engine.md)   | `src/core/engine`                 |
| Game rules (reducer)                | [game.md](game.md)       | `src/core/game`                   |
| Data: storage, stats, packs, supply | [data.md](data.md)       | `src/core/stats`, `src/services`  |
| App runtime (stores, events)        | [app.md](app.md)         | `src/app`, `src/main.tsx`         |
| UI (screens, components)            | [ui.md](ui.md)           | `src/ui`, `src/index.css`         |
| Tests                               | [testing.md](testing.md) | `*.test.ts(x)`, `src/test`, `e2e` |

Product behavior (Spanish) is in `docs/PLAN.md`; upcoming work in `docs/ROADMAP_TICKETS.md`; files
copied from the Sudoku app in `docs/SHARED_INFRA.md`.

## Layers

```
ui ──▶ app ──▶ services ──▶ core
 └──────(types only)──────────▲
```

- `core`: pure TypeScript. No React, Capacitor, DOM, `Math.random` or `Date.now` (time and RNG are injected).
- `services`: adapters behind interfaces. The only place that imports Capacitor.
- `app`: Zustand stores, event bus, subscribers, selectors and React hooks. Exposes core values to ui.
- `ui`: React + Tailwind. Imports app; from core only `import type`.
- `src/main.tsx`: composition root (`createServices()` → `createAppRuntime()` → `<App />`).

ESLint enforces all of the above (`eslint.config.js`).

## Life of a stroke

1. `usePaintStroke` (Board) turns pointer events into `beginStroke(cell)`, `extendStroke(cells)` and
   `endStroke()` from `useGameActions()`.
2. `gameStore.dispatch` runs the pure `gameReducer(state, action, { now, settings })`.
3. The reducer returns `{ state, events }`. The store saves `state` and emits `events` on the bus.
4. Bus subscribers in `createAppRuntime` update stats, the Collection record and analytics, and drop
   the saved game on finish.
5. A store subscription debounces `persistence.saveGame` (300 ms).
6. React re-renders through granular selectors (`useGameStore`, `useGameViews`).

## Where to change X

| Task                                | Start here                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| New player action (button, gesture) | `core/game/types.ts` → reducer → `useGameActions` (skill `adding-game-action`) |
| New deduction technique / tier      | `core/engine` (skill `adding-line-technique`)                                  |
| New Collection puzzle               | `content/packs` (skill `adding-pack-puzzle`)                                   |
| Change persisted shape              | `services/storage/schemas.ts` (skill `migrating-persisted-data`)               |
| New setting                         | `core/settings.ts`, `schemas.ts`, `SettingsScreen`                             |
| New screen or component             | `src/ui` (skill `adding-ui-component`)                                         |
| React to a game event (ads, haptic) | subscriber in `app/runtime/createAppRuntime.ts`                                |
| UI text                             | `src/ui/strings/es.ts`                                                         |
| Colors / animations                 | `src/index.css` (`@theme` tokens, `.dark` overrides)                           |
