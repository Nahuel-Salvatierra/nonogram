---
name: adding-line-technique
description: Adds or changes a Nonogram deduction technique (line solver tier, propagation, probing) and recalibrates the difficulty analyzer and hints. Use when touching lineSimple, lineSolver, propagate, probe, analyzer thresholds or difficulty profiles in src/core/engine.
---

# Adding a Line Technique

```
- [ ] 1. Implement the technique as a pure function
- [ ] 2. Wire it into propagate (or the analyzer for board-level techniques)
- [ ] 3. Add line or board fixtures that require it
- [ ] 4. Test deductions, contradictions and consistency with lineSolver
- [ ] 5. Recalibrate analyzer/profiles with pnpm benchmark and bump ANALYZER_VERSION
- [ ] 6. Update hint text if the hint can surface it
- [ ] 7. pnpm build:packs, pnpm check
```

## 1. Contract

Line techniques live in `src/core/engine/` and share the shape of `lineSolver.ts`:

- Input: a `Line` (`readonly CellState[]`) and its `Clue` (`readonly number[]`).
- Output: a new `Line` with the forced cells set, the same reference when nothing changes, or `null`
  on contradiction.
- Pure; never read the solution. Never mutate the input.

## 2. Tiers

- T1 `lineSimple`: overlap of leftmost/rightmost placements and unreachable cells.
- T2 `lineSolver`: complete line deduction (prefix/suffix DP).
- T3 is not a technique: it is T2 with many rounds and a low first-pass ratio (analyzer metric).
- T4 `probe`: assume a cell, propagate, keep the opposite on contradiction.

A new technique gets a tier in `Tier` (`analyzer.ts`) and is tried by `propagate` in tier order
(cheapest first). A weaker tier must never deduce something a stronger tier contradicts.

## 3-4. Tests

- `<name>.test.ts` with hand-written lines (`parseLine('..#x...')`).
- Property test (fast-check): every cell the technique decides is decided the same way by
  `lineSolver`.

## 5. Calibration

`pnpm benchmark` prints rating distribution per size and difficulty. Adjust thresholds in
`profiles.ts`, bump `ANALYZER_VERSION` (and `GENERATOR_VERSION` if generated puzzles change) in
`versions.ts`, then run `pnpm build:packs` so `packs.json` matches.

## 6. Hint text

Hint messages live in `src/ui/strings/es.ts` under `hints`.
