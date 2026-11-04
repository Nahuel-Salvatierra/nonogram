import { SIZE_OF } from '../engine/difficulty'
import type { Size } from '../engine/grid'
import type { GameState } from './types'

export const sizeOf = (state: GameState): Size => SIZE_OF[state.sizeId]

export const isLocked = (state: GameState, cell: number): boolean =>
  state.hintedCells.includes(cell) || state.errorCells.includes(cell)
