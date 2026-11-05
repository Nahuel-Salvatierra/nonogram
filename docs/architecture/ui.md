# UI (`src/ui`, `src/index.css`)

React 19 + Tailwind 4. Imports app; from core only `import type`. Strings live in
`strings/es.ts`. Routes (`routes.ts`, HashRouter): `/`, `/collection`, `/game`, `/victory`,
`/stats`, `/settings`, `/how-to-play`.

## Screens (`screens/`)

Each screen has a `useXxx` hook with the logic and a component with the markup.

| Screen      | Notes                                                                                                                                                                                                                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home        | logo (`PixelArt`), "Continuar" card (size, difficulty, time), Colección (progress), Partida rápida sheet (`QuickPlaySheet`: size tabs, difficulties per size, best time). Confirms before leaving an active quick game                                                                                                                         |
| Collection  | size tabs, `PackSection` per pack, `PuzzleCard`: "?" until solved, progress bar in progress, thumbnail + best time when completed                                                                                                                                                                                                              |
| Game        | `GameHeader` (back, "?" or size, mistakes `n/3` with auto-validate, timer, pause), `GameMessages` (hint banner or tutorial tip), `Board` (keyed by `gameId`), `Toolbar`, `ToolToggle`, `PauseOverlay`, `LostOverlay` (Reintentar / Volver), `HintAdDialog` (no free hints left: close only). Back pauses and returns to the Collection or Home |
| Victory     | keeps the result it mounted with (so clearing the store never redirects it); reveal animation, name, stats, "Siguiente puzzle" / "Otra igual"                                                                                                                                                                                                  |
| Stats       | size and difficulty scopes + Collection progress per size                                                                                                                                                                                                                                                                                      |
| Settings    | theme, toggles, reset stats, version                                                                                                                                                                                                                                                                                                           |
| How to play | rules with `MiniLine` diagrams and a button to the first tutorial puzzle                                                                                                                                                                                                                                                                       |

Tutorial tips: `strings.tips[i]` for the first 3 puzzles of the tutorial pack (`tutorialIndexOf`).

## Board (`components/Board`)

- `boardLayout.ts` `boardStyle(layout, zoom)`: one CSS grid `[row clues | cells] x [col clues | cells]`.
  `--base = clamp(14px, min(100cqw / (cols + rowClueLen*0.55), 100cqh / (rows + colClueLen*0.55)), 56px)`
  sizes the tracks (the viewport never grows); `--cell = --base * zoom` sizes the content inside.
  15x15 fits at about 17 px per cell on a 360 dp phone; zoom brings cells back to a touch size.
  `Board` owns the `container-type: size` wrapper, below the `ZoomControls` row.
- Zoom (`boardZoom.ts`, pure, with tests; `useBoardZoom`): zoom 1x–3x and a pan in viewport units
  (`0..zoom-1`). Each zone clips (`overflow-hidden`): cells translate on both axes, column clues
  only on X and row clue only on Y, so clues stay fixed at the edges. Two fingers anywhere on the
  board pinch and pan; the wheel pans; `ZoomControls` (Alejar / Acercar / Ajustar tablero) zoom
  around the center for players who cannot pinch. The board frame is a `ring` so the viewport
  equals the content at 1x.
- `ClueLine`: one line of clue numbers (font `max(11px, 0.5 * --base)`, so zoom only spreads the
  numbers), dimmed when done, highlighted when active or hinted. Screen-reader text via `sr-only`.
- `Cell` (memo): `role="img"` with `aria-label`, `data-cell`, `data-state`. Filled = solid block;
  crossed = faint X; error = red X over a hatched background; guide borders every 5 cells.
- `usePaintStroke(size)`: Pointer Events on the cell grid (`touch-action: none`) with pointer capture.
  The cell under the pointer comes from the grid's bounding rect (works under capture and outside the
  board, clamped to the edge), falling back to the target's `data-cell`. A 6 px dead zone runs
  before the stroke extends; `strokeSpan` fills the gap between the origin and the pointer.
  Touch strokes wait up to 80 ms (or the dead zone, or the lift) before `beginStroke`, so a pinch
  never paints (or costs a life). A second finger calls `cancel()`: a pending stroke is dropped and
  a started one ends with `endStroke`.
- The count bubble shows `strokeCount` while a multi-cell stroke is active.

## Components (`components/`)

Shared with the Sudoku (see `docs/SHARED_INFRA.md`): Button, ConfirmDialog, Icon, IconButton, Modal,
ScreenHeader, SegmentedControl, StatTile, Toggle. Nonogram-only: Board (+ ZoomControls), PixelArt,
ToolToggle, Toolbar (+ ToolButton), GameHeader.

## Tokens (`index.css`)

Accent teal (`#0f766e` light, `#2dd4bf` dark). Nonogram tokens: `cell`, `cell-filled`,
`cell-crossed`, `cell-hinted`, `cell-highlight`, `clue-done`, `line-guide`, all with `.dark`
overrides. Animations: `pop`, `fade-in`, `slide-up`, `celebrate`, `reveal` (600 ms clip-path);
`prefers-reduced-motion` shortens everything.
