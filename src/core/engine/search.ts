import type { Clues } from './clues'
import { emptyCells, linesOfCell, type CellState, type LineRef, type Size } from './grid'
import { propagate } from './propagate'

const count = (
  size: Size,
  clues: Clues,
  cells: readonly CellState[],
  limit: number,
  dirty?: readonly LineRef[],
): number => {
  const result = propagate(size, clues, cells, 2, dirty)
  if (result.status === 'contradiction') return 0
  if (result.status === 'solved') return 1
  const cell = result.cells.indexOf('unknown')
  let total = 0
  for (const guess of ['filled', 'crossed'] as const) {
    const next = [...result.cells]
    next[cell] = guess
    total += count(size, clues, next, limit - total, linesOfCell(size, cell))
    if (total >= limit) return total
  }
  return total
}

export const countSolutions = (
  size: Size,
  clues: Clues,
  limit = 2,
  cells: readonly CellState[] = emptyCells(size),
): number => count(size, clues, cells, limit)
