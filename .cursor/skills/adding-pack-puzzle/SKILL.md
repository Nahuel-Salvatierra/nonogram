---
name: adding-pack-puzzle
description: Adds or edits a Collection puzzle in content/packs, validates it with build-packs (unique, logically solvable, rated) and fixes ambiguous cells. Use when creating Collection puzzles or packs, or when build-packs reports an invalid puzzle.
---

# Adding a Pack Puzzle

```
- [ ] 1. Draw the puzzle in content/packs/<pack>.txt
- [ ] 2. Run pnpm build:packs
- [ ] 3. Fix ambiguous or invalid puzzles until the script passes
- [ ] 4. Add the Spanish name and commit packs.json together with the .txt
- [ ] 5. pnpm check (the pack test re-validates every puzzle)
```

## 1. Format

```text
pack: animals-10
title: Animales

puzzle: cat
name: Gato
#........#
##......##
...
```

- `pack` is the stable pack id; `puzzle` is the stable slug. The puzzle id is `pack/slug` and is
  persisted, so never rename it after release.
- One row per line, `#` filled and `.` empty. All rows of a pack have the same size (5x5, 10x10 or 15x15).
- A blank line separates puzzles.

## 2-3. Validation

`scripts/build-packs.ts` checks shape, `countSolutions(limit = 2) === 1`, and that the analyzer solves
it by deduction. On failure it prints the puzzle id and the undetermined cells as a grid (`?`).

To fix an ambiguous drawing, change one of the `?` cells (or a neighbor) and re-run. Small changes to
silhouettes usually break the ambiguity. Avoid 2x2 checker patterns: they are always ambiguous.

## 4. Output

The script writes `src/services/puzzles/packs.json` with `analyzerVersion` and the difficulty and
score of each puzzle, sorted by score inside each pack. Never edit the JSON by hand.
