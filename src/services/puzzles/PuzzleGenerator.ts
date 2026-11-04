import type { Difficulty, SizeId } from '@core/engine/difficulty'
import type { QuickPuzzle } from './quickPuzzle'

export type GenerateRequest = {
  readonly id: number
  readonly sizeId: SizeId
  readonly difficulty: Difficulty
  readonly seed: number
}

export type GenerateResponse = {
  readonly id: number
  readonly puzzle: QuickPuzzle | null
}

export interface PuzzleGenerator {
  generate(sizeId: SizeId, difficulty: Difficulty, seed: number): Promise<QuickPuzzle | null>
}
