---
name: adding-game-action
description: Adds a new action to the pure game reducer in src/core/game, deciding undo behavior, domain events and persistence impact, with tests. Use when adding or changing player actions, game state fields or domain events.
---

# Adding a Game Action

```
- [ ] 1. Add the action to the GameAction union
- [ ] 2. Implement the handler and wire it in the reducer switch
- [ ] 3. Decide undo/redo behavior
- [ ] 4. Decide domain events emitted
- [ ] 5. Check persistence impact
- [ ] 6. Expose it through the app store
- [ ] 7. Reducer tests
- [ ] 8. pnpm check
```

## 1-2. Reducer

- Types in `src/core/game/types.ts`; handlers in focused files (`strokes.ts`, `hints.ts`, `lifecycle.ts`).
- `gameReducer(state, action, context)` returns `{ state, events }` and never mutates the input.
- The `switch` stays exhaustive (`assertNever`).
- Ignore actions that do not apply (e.g. painting a hinted cell, or a paused game) by returning the
  same state with no events.

## 3. Undo

- Board-changing player actions push `Move`s (cell, before, after, batch) to `history` and clear
  `redoStack`. All moves of one stroke share a `batch` so undo reverts the stroke in one step.
  History is capped at `HISTORY_LIMIT`.
- Hints and auto-corrections are never undoable. Tool changes, pause and resume do not enter history.

## 4. Events

- Add new events to the `GameEvent` union in `events.ts`. Events carry the data stats,
  analytics and ads need (difficulty, elapsed time, mistakes, hints).
- Stats/analytics/ads react in app subscribers, never inside the reducer.

## 5. Persistence

- If `GameState` shape changes, follow the `migrating-persisted-data` skill.

## 6. Store

- The store already forwards every action through `dispatch` in `src/app/stores/gameStore.ts`.
- Expose a typed helper in `src/app/hooks/useGameActions.ts` so the UI never builds actions inline.

## 7. Tests

- `<file>.test.ts`: happy path, ignored cases, undo/redo interaction, emitted events.
