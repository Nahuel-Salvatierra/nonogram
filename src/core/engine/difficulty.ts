import type { Size } from './grid'

export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const

export type Difficulty = (typeof DIFFICULTIES)[number]

export const SIZE_IDS = ['5x5', '10x10', '15x15'] as const

export type SizeId = (typeof SIZE_IDS)[number]

export const SIZE_OF: Readonly<Record<SizeId, Size>> = {
  '5x5': { rows: 5, cols: 5 },
  '10x10': { rows: 10, cols: 10 },
  '15x15': { rows: 15, cols: 15 },
}

export const sizeIdOf = (size: Size): SizeId | null =>
  SIZE_IDS.find((id) => SIZE_OF[id].rows === size.rows && SIZE_OF[id].cols === size.cols) ?? null

export const DIFFICULTIES_BY_SIZE: Readonly<Record<SizeId, readonly Difficulty[]>> = {
  '5x5': ['easy', 'medium'],
  '10x10': DIFFICULTIES,
  '15x15': DIFFICULTIES,
}

export const isDifficultyAvailable = (sizeId: SizeId, difficulty: Difficulty): boolean =>
  DIFFICULTIES_BY_SIZE[sizeId].includes(difficulty)
