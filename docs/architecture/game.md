# Game rules (`src/core/game`)

`gameReducer(state, action, { now, settings })` is pure and returns `{ state, events }`. It stamps
`lastPlayedAt`. Unchanged actions return the same state object.

## State (`types.ts`)

| Field                                       | Meaning                                                          |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `gameId`, `puzzleId`, `mode`, `name`        | `mode` is `'collection'` or `'quick'`; `name` only in Collection |
| `sizeId`, `difficulty`, `solution`, `clues` | `clues` are derived from the solution (not persisted)            |
| `cells`                                     | `CellState[]`, row-major                                         |
| `errorCells`, `hintedCells`                 | locked cells (`board.ts` `isLocked`): strokes and undo skip them |
| `tool`                                      | `'fill' \| 'cross'`                                              |
| `activeStroke`, `focusedCell`               | transient (not persisted): current stroke and highlighted cell   |
| `mistakes`, `countedMistakes`               | each cell counts as a mistake once; `MAX_MISTAKES = 3` loses     |
| `hintsUsed`, `hintsRemaining`               | `hintsRemaining` mirrors the free daily hints left (set by app)  |
| `elapsedMs`, `runningSince`                 | timer (`timer.ts`)                                               |
| `status`                                    | `playing` / `paused` / `lost` / `completed` / `abandoned`        |
| `history`, `redoStack`                      | `Move { cell, before, after, batch }`, capped at 300             |
| `lastHint`                                  | `HintInfo` shown in the banner                                   |

## Actions

| Action                    | File           | Behavior                                                                                                                                                          |
| ------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setTool`                 | `strokes.ts`   | ignored during a stroke                                                                                                                                           |
| `beginStroke { cell }`    | `strokes.ts`   | mode from the first cell: if it is already in the tool's state, the stroke empties; otherwise it paints unknown cells. New `batch` id                             |
| `extendStroke { cells }`  | `strokes.ts`   | axis locks on the first extension; off-axis and visited cells are ignored                                                                                         |
| `endStroke`               | `strokes.ts`   | auto-cross (if enabled) lines through the visited cells, same batch                                                                                               |
| `undo`, `redo`            | `history.ts`   | whole batch at once; blocked during a stroke; locked cells are skipped                                                                                            |
| `hint`, `dismissHint`     | `hints.ts`     | see below; `hint { isRewarded }` is the ad-paid hint                                                                                                              |
| `pause`, `resume`, `tick` | `lifecycle.ts` | `pause` clears the stroke and focus                                                                                                                               |
| `restart`                 | `lifecycle.ts` | clears the board and `errorCells`; keeps hinted cells, time, mistakes and hints                                                                                   |
| `retry`                   | `lifecycle.ts` | only from `lost`: fresh board (hinted cells too), mistakes and time reset, spent hints not refunded; `restartCount + 1`, `gameRestarted`                          |
| `continue`                | `lifecycle.ts` | only from `lost`: back to `playing` with the same board, hints and time, `mistakes = MAX_MISTAKES - 1`; `gameContinued`. The UI does not call it until ads return |
| `abandon`                 | `lifecycle.ts` | from `playing`, `paused` or `lost`; emits `gameAbandoned { summary, progress }`                                                                                   |

Painting goes through `cells.ts` `paintCell`: with `autoValidate`, a wrong **fill** becomes a cross
plus an `errorCell` (not recorded in history) and emits `mistakeMade` once per cell. Wrong crosses
are allowed; the hint policy reports them.

Every board change ends in `completion.ts` `afterBoardChange`:

- If the change made a new mistake and `mistakes >= MAX_MISTAKES` (`reachedMistakeLimit`), the game
  becomes `lost`, the timer stops and `gameLost { summary }` is emitted. The stroke stops painting
  at that cell. Mistakes only happen with `autoValidate`, so with it off there is no limit.
- Otherwise, when filled cells equal the solution, the game becomes `completed`, the timer stops and
  `gameCompleted { summary }` is emitted.

Losing does not end the game for stats: a lost game is still saved and resumable (it reopens with
the lost dialog) until it is retried, completed or abandoned.

## Hint policy (`hints.ts`)

1. If there are wrong cells: `lastHint = errors { cells }`, free.
2. If no free hints remain and the hint is not rewarded: `exhausted` + `hintsExhausted` (the UI
   offers an ad).
3. Otherwise apply a T1 line deduction (the line that changes the most cells), falling back to T2:
   `line { line, cells, tier }`.
4. If neither applies, reveal one cell of the most constrained line: `reveal { cell }`.

Hinted cells are locked and are not part of history. A free hint decrements `hintsRemaining`; a
rewarded one does not. `hintUsed` carries `isRewarded`. `withFreeHints(state, count)` syncs the
visible count from the daily budget (`core/hints/dailyHints.ts`: `FREE_HINTS_PER_DAY = 3`,
`localDayOf`, `freeHintsLeft`, `consumeFreeHint`).

## Events (`events.ts`)

`gameStarted`, `mistakeMade`, `hintUsed`, `hintsExhausted`, `gamePaused`, `gameResumed`,
`gameRestarted`, `gameLost { summary }`, `gameContinued`, `gameCompleted { summary }`,
`gameAbandoned { summary, progress }`. `progress` is
correct filled cells over solution cells (`progressOf`).

## Tests

`__fixtures__/testGame.ts`: `createTestGame({ board })` (5x5 plan example), `run(state, actions)`,
`tap(cell)` and `testContext(now, settings)` (auto-cross off by default).
