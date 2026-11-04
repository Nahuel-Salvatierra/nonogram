# Nonogram engine (`src/core/engine`)

Pure TypeScript: no React, DOM, `Math.random` or `Date.now` (RNG comes from `rng.ts`). Imports are
relative so Node scripts (`scripts/*.ts`, run with tsx) can use the engine too.

## Data shapes

| Type           | File            | Shape                                                                                |
| -------------- | --------------- | ------------------------------------------------------------------------------------ |
| `CellState`    | `grid.ts`       | `'unknown' \| 'filled' \| 'crossed'`                                                 |
| `Size`         | `grid.ts`       | `{ rows, cols }`; grids are row-major arrays of `rows * cols`                        |
| `LineRef`      | `grid.ts`       | `{ axis: 'row' \| 'col', index }`; `allLines` = rows first, then columns             |
| `Clue`/`Clues` | `clues.ts`      | `readonly number[]` per line (`[]` = empty line); `{ rows, cols }`                   |
| `Solution`     | `clues.ts`      | `readonly boolean[]` (filled or not)                                                 |
| `SizeId`       | `difficulty.ts` | `'5x5' \| '10x10' \| '15x15'`; `SIZE_OF`, `DIFFICULTIES_BY_SIZE` (5x5: easy, medium) |

Text formats (`text.ts`):

- Lines for tests: `.` unknown, `#` filled, `x` crossed (`parseLine`, `formatLine`).
- Saved cells: one char per cell, `u`/`f`/`x` (`encodeCells`, `decodeCells`).
- Solutions and pack rows: `#`/`.` (`encodeSolution`, `decodeSolution`, `parsePattern`, `formatPattern`).

## Line deductions

Every deduction has the signature `LineDeduction = (line, clue) => Line | null` (`null` means
contradiction) and only turns `unknown` cells into `filled` or `crossed`.

| Tier | File             | What it does                                                                                                                                                     |
| ---- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1   | `lineSimple.ts`  | Relaxed extremes using crosses only (filled cells treated as unknown): overlap, unreachable cells, completed line (filled count equals the clue sum and matches) |
| T2   | `lineSolver.ts`  | Exact: prefix/suffix DP over `placements.ts` (`buildPlacementTable`), every cell that has the same value in all placements                                       |
| T3   | (classification) | T2 was needed and propagation was deep (`isDeepPropagation`: ≥ 11 rounds, first pass < 0.2)                                                                      |
| T4   | `probe.ts`       | Probing: assume a value for one cell, propagate, keep the opposite on contradiction                                                                              |

`propagate.ts` runs T1 to a fixpoint (dirty-line queue), then one T2 sweep over all lines, and
repeats. It returns `{ cells, status: 'solved' | 'stuck' | 'contradiction', steps, rounds }`.
`deduceLine` is the single-line entry point the hint policy reuses. `probe.ts` scans cyclically from
the last successful probe (`findProbe`, `solveWithProbing`). `search.ts` counts solutions with
backtracking (`countSolutions(size, clues, limit = 2)`) to prove uniqueness.

## Rating and generation

- `analyzer.ts`: `ratePuzzle(size, clues, maxTier = 4)` → `Rating` with `maxTier`, `rounds`, `steps`,
  `probes`, `firstPassRatio`, `density`, `score` (`tier*100 + rounds*3 + probes*15 + (1-firstPass)*30`),
  `difficulty` and the `unresolved` cells.
- `profiles.ts`: `classify` (tier 4 expert, 3 hard, 2 medium, 1 easy if first pass ≥ 0.25) and the
  generation `PROFILES` (density range, max solver tier, smoothing passes, attempts).
- `patterns.ts`: noise + optional symmetry + smoothing + isolated-cell removal (`buildPattern`).
- `generator.ts`: `generatePuzzle(rng, size, difficulty)`. Each attempt builds a pattern and rates
  it; while unsolvable it flips a random unresolved cell (up to `MAX_FIXUPS = 20`). Accepted only if
  the rating matches the difficulty and density range. `quickPuzzleId(seed)` =
  `quick-<seed>-v<GENERATOR_VERSION>`.
- `versions.ts`: bump `GENERATOR_VERSION` when generation output changes for the same seed, and
  `ANALYZER_VERSION` when ratings change (then rerun `pnpm build:packs`).
- `packText.ts`: parser for `content/packs/*.txt` (`pack:`/`title:` header, then `puzzle:`, `name:`
  and the rows).

## Validation (`validator.ts`)

`isWrongCell` (filled where empty or crossed where filled), `findErrors`, `completedLines` (lines whose
filled blocks match their clue), `isSolved` (filled cells equal the solution; crosses optional) and
`solutionCells`.

## Tools

- `pnpm benchmark`: success rate and time per size and difficulty (`scripts/benchmark-generator.ts`).
- `pnpm generate:quick-pack`: regenerates `services/puzzles/quickPack.json`.
- `pnpm build:packs`: validates and rates the Collection (see [data.md](data.md)).

## Tests

Fixtures in `__fixtures__/puzzles.ts` (`PLAN_EXAMPLE`, `NEEDS_LINE_SOLVER`, `NEEDS_PROBING`,
`NEEDS_PROBING_10`). `lineSolver.test.ts` checks T2 against brute force with fast-check; T1 is checked
to be consistent with T2. Generator tests are deterministic by seed.
