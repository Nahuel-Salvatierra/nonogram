# App runtime (`src/app`)

Glue between the pure core, the services and React. Contains no UI and no Capacitor imports.

## Runtime (`runtime/createAppRuntime.ts`)

`createAppRuntime(services, mockAdStore?)` builds everything and returns an `AppRuntime`:

| Member                        | Purpose                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `gameStore`                   | current game, `dispatch`, `requestHint`, `openCollectionPuzzle`, `startQuickGame` |
| `rewardedAds`                 | `watchForHint()`, `watchToContinue()` (`rewardedAds.ts`)                          |
| `mockAdStore`                 | pending test ad shown by `MockAdDialog` (`stores/mockAdStore.ts`)                 |
| `settingsStore`, `statsStore` | hydrated from persistence, save on change                                         |
| `collectionStore`             | Collection record + in-progress `progress` per puzzle id                          |
| `bus`                         | `EventBus<GameEvent>` (`eventBus.ts`)                                             |
| `backStack`                   | LIFO of back handlers (`backStack.ts`)                                            |
| `start()`                     | load docs → hydrate stores → bump meta → wire → hide splash → `puzzles.refill()`  |
| `flushSave()`                 | save the active game now (cancels the debounce)                                   |
| `afterVictory()`              | hook for the future interstitial                                                  |
| `dispose()`                   | remove subscribers and timers                                                     |

Wiring:

- **Bus subscriber:** analytics (`analyticsEvents.ts`), `statsStore.apply`, `collectionStore.apply`.
  - `hintUsed` without `isRewarded`: `hintBudget.consume()` saves the daily budget in `meta`.
  - `gameCompleted`: `persistence.removeGame`, clear progress, `gameStore.finish({ summary,
isNewRecord, name, solution, nextPuzzleId })`.
  - `gameAbandoned`: `removeGame`, clear progress, `finish(null)`.
- **Game changes:** an active game schedules a save (`SAVE_DEBOUNCE_MS = 300`) and, in Collection
  mode, updates `collectionStore.progress`.
- **Background:** `lifecycle.onActiveChange(false)` dispatches `pause` and calls `flushSave()`.
- **Back button:** `backStack.handle()`; with no handler, `lifecycle.exitApp()`.
- **Tick:** every `TICK_INTERVAL_MS = 5000` it dispatches `tick`.

`gamePersistence.ts`: `toPersistedGame` syncs the timer; `fromPersistedGame` restores a playing game
as paused; `isActiveGame`.

Ads (rewarded only, always player-initiated):

- `hintBudget.ts`: free daily hints from `meta` (`freeHints()`, `consume()`). The game store sets
  `hintsRemaining` from it when a game is created or restored and before each `requestHint`.
- `rewardedAds.ts`: `watchForHint` shows `extraHint`; on `rewarded` it resumes a game paused by the
  ad and dispatches `hint { isRewarded: true }`. `watchToContinue` shows `continueAfterLoss` and
  dispatches `continue`. `dismissed` and `failed` grant nothing; both return the `RewardedResult`.
- `main.tsx` creates the `mockAdStore` and passes its `present` to `createServices`, which uses the
  mock unless `VITE_ADS_MODE=admob`.

## Stores (`stores/`)

Vanilla Zustand stores (`createStore`), consumed in React through `useStore`.

- `gameStore.ts` `{ game, lastResult, isStarting }`:
  - `openCollectionPuzzle(id)`: no-op if it is already the active game. Otherwise it leaves the
    current game, then resumes the saved game for that puzzle (paused) or creates a new one.
  - `startQuickGame(sizeId, difficulty)`: leaves the current game, `puzzles.take`, `createGame`.
  - Leaving: a quick game is **abandoned** (the UI confirms first); a Collection game is paused and
    saved, so its progress stays in the `games` LRU.
- `settingsStore.ts`: `update(patch)` merges and saves.
- `statsStore.ts`: `apply(event)` returns `{ before, after }`; `reset()`.
- `collectionStore.ts`: `apply(event, now)` saves the record; `setProgress(id, value | null)`.

## React access

`AppRuntimeContext.tsx`: `AppRuntimeProvider`, `useRuntime()`, and selector hooks `useGameStore`,
`useSettingsStore`, `useStatsStore`, `useCollectionStore`, `useMockAdStore`. Always select narrowly.

| Hook (`hooks/`)                      | Returns                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `useGameActions`                     | stable callbacks (`beginStroke`, `endStroke`, `undo`, `hint`, `watchAdForHint`, `retry`, `watchAdToContinue`, `pause`, `startQuickGame`...) |
| `useGameViews`                       | memoized `cells: CellView[]` and `clues: { rows, cols }: ClueView[]`                                                                        |
| `useElapsedMs`                       | display time, re-rendering every 500 ms only while running                                                                                  |
| `useBackButton(handler, isEnabled?)` | registers on the back stack while mounted                                                                                                   |
| `useThemeSync`                       | toggles `.dark` on `<html>` and the status bar                                                                                              |

## Selectors (what ui uses instead of core)

- `game/selectors.ts`: `buildCellViews` (state, error, hinted, highlighted line, hint target, guide
  borders every 5), `buildClueViews` (done, active, hint line), `longestClue`, `strokeCount`.
- `game/strokeSpan.ts`: `strokeSpan(size, origin, target, axis)` projects the pointer onto the stroke
  axis (dominant axis until locked) and returns every cell in between, so fast swipes never skip.
- `collection/selectors.ts`: `buildPackViews`, `sizeProgress`, `overallProgress`, `tutorialIndexOf`,
  `firstTutorialPuzzleId`.
- `stats/selectors.ts`: `selectStatsView(stats, size | 'all', difficulty | 'all')`, `bestTimeOf`.
- `catalog.ts`: re-exports sizes, difficulties, tools, themes, `MAX_MISTAKES`, `FREE_HINTS_PER_DAY`,
  `TUTORIAL_PACK_ID` and the `RewardedPlacement` / `RewardedResult` types.

## Tests

`runtime/createAppRuntime.test.ts` (quick and Collection completion, progress kept when switching
puzzles, restore, background save, quick-game abandon, back button, meta, daily hint budget),
`runtime/rewardedAds.test.ts`, `stores/mockAdStore.test.ts` plus selector tests.
