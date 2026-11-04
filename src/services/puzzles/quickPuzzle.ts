import { SIZE_OF, type Difficulty, type SizeId } from '@core/engine/difficulty'
import { generatePuzzle, quickPuzzleId } from '@core/engine/generator'
import { createRng } from '@core/engine/rng'
import { encodeSolution } from '@core/engine/text'

export type QuickPuzzle = {
  readonly id: string
  readonly sizeId: SizeId
  readonly difficulty: Difficulty
  readonly solution: string
  readonly score: number
  readonly generatorVersion: number
}

export const generateQuickPuzzle = (
  sizeId: SizeId,
  difficulty: Difficulty,
  seed: number,
): QuickPuzzle | null => {
  const puzzle = generatePuzzle(createRng(seed), SIZE_OF[sizeId], difficulty)
  if (!puzzle) return null
  return {
    id: quickPuzzleId(seed),
    sizeId,
    difficulty,
    solution: encodeSolution(puzzle.solution),
    score: puzzle.score,
    generatorVersion: puzzle.generatorVersion,
  }
}
