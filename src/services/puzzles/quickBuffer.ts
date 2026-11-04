import type { Difficulty, SizeId } from '@core/engine/difficulty'
import type { QuickPuzzle } from './quickPuzzle'

export const BUFFER_SIZE_PER_KIND = 1
export const RECENT_IDS_LIMIT = 50

export type QuickBuffer = {
  readonly puzzles: readonly QuickPuzzle[]
  readonly recentIds: readonly string[]
}

export const createEmptyBuffer = (): QuickBuffer => ({ puzzles: [], recentIds: [] })

export const isKind =
  (sizeId: SizeId, difficulty: Difficulty) =>
  (puzzle: QuickPuzzle): boolean =>
    puzzle.sizeId === sizeId && puzzle.difficulty === difficulty
