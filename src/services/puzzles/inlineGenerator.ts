import type { PuzzleGenerator } from './PuzzleGenerator'
import { generateQuickPuzzle } from './quickPuzzle'

export const createInlineGenerator = (): PuzzleGenerator => ({
  generate: async (sizeId, difficulty, seed) => generateQuickPuzzle(sizeId, difficulty, seed),
})
