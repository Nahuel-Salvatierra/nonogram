# Tests

| Command          | What                                                              |
| ---------------- | ----------------------------------------------------------------- |
| `pnpm check`     | `tsc -b`, `eslint .` and `vitest run` (unit + integration, jsdom) |
| `pnpm test:e2e`  | Playwright on the production build, Pixel 7 viewport              |
| `pnpm benchmark` | generator success rate and timing (not part of `check`)           |

## Unit (Vitest)

- Engine: one test file per module in `src/core/engine`. `lineSolver.test.ts` compares T2 with brute
  force using fast-check. Fixtures in `__fixtures__/puzzles.ts`.
- Game: `strokes`, `hints`, `lifecycle` with `__fixtures__/testGame.ts`.
- Stats and Collection record: `src/core/stats/*.test.ts`.
- Services: persistence round-trips (compact cells, LRU, corrupt keys), puzzle supply,
  `collection.test.ts` (every pack puzzle is unique and solvable).
- App: `createAppRuntime.test.ts` and selector tests.

## Integration (RTL)

`src/ui/App.test.tsx` renders `AppRoutes` with `renderApp(createTestServices(TEST_QUICK_PUZZLE))`
(`src/test`). The fixed supply always returns the 5x5 plan example; time is controlled with
`services.setNow`, lifecycle with `services.lifecycle`.

- Tap: `pointerDown` + `pointerUp` on the cell element. Keep the element reference: the last tap
  can complete the puzzle and unmount the board before `pointerUp`.
- Drag: `pointerDown` on the origin, `pointerMove` on the target with `clientX` past the 6 px dead
  zone. jsdom has no layout, so `usePaintStroke` falls back to the target's `data-cell`.

## E2E (Playwright)

`e2e/game.spec.ts` with helpers in `e2e/helpers.ts`:

- `readSavedGame` reads the newest entry of `CapacitorStorage.games` from `localStorage` (the web
  Preferences backend) to get the solution.
- `solveByDragging` drags each run of filled cells per row with the real mouse (`dragCells`).
- Scenarios: drag a row and undo it, complete a quick 5x5 and see it in stats, complete a Collection
  puzzle and see its thumbnail, restore after reload, abandon and stats, dark theme persists.

## Android

Manual checklist and release steps in `docs/QA_CHECKLIST.md` (needs JDK 21).
