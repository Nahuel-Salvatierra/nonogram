import { cellCount, colOf, indexOf, rowOf, type Size } from './grid'
import type { Rng } from './rng'

export const SYMMETRIES = ['none', 'vertical', 'horizontal'] as const

export type Symmetry = (typeof SYMMETRIES)[number]

const mirrorOf = (size: Size, cell: number, symmetry: Symmetry): number => {
  const row = rowOf(size, cell)
  const col = colOf(size, cell)
  if (symmetry === 'vertical') return indexOf(size, row, size.cols - 1 - col)
  if (symmetry === 'horizontal') return indexOf(size, size.rows - 1 - row, col)
  return cell
}

export const noisePattern = (
  rng: Rng,
  size: Size,
  density: number,
  symmetry: Symmetry,
): boolean[] => {
  const cells = new Array<boolean>(cellCount(size)).fill(false)
  for (let cell = 0; cell < cells.length; cell++) {
    const mirror = mirrorOf(size, cell, symmetry)
    cells[cell] = mirror < cell ? cells[mirror] : rng.next() < density
  }
  return cells
}

const NEIGHBORS = [-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => [dr, dc] as const))

const ORTHOGONAL = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const

const countAround = (
  size: Size,
  cells: readonly boolean[],
  cell: number,
  offsets: readonly (readonly [number, number])[],
): { readonly filled: number; readonly total: number } => {
  const row = rowOf(size, cell)
  const col = colOf(size, cell)
  let filled = 0
  let total = 0
  for (const [dr, dc] of offsets) {
    const r = row + dr
    const c = col + dc
    if ((dr === 0 && dc === 0) || r < 0 || c < 0 || r >= size.rows || c >= size.cols) continue
    total++
    if (cells[indexOf(size, r, c)]) filled++
  }
  return { filled, total }
}

export const smoothPattern = (size: Size, cells: readonly boolean[], passes: number): boolean[] => {
  let current = [...cells]
  for (let pass = 0; pass < passes; pass++) {
    current = current.map((isFilled, cell) => {
      const { filled, total } = countAround(size, current, cell, NEIGHBORS)
      const ratio = filled / total
      if (ratio > 0.55) return true
      if (ratio < 0.4) return false
      return isFilled
    })
  }
  return current
}

export const removeIsolated = (size: Size, cells: readonly boolean[]): boolean[] =>
  cells.map((isFilled, cell) => {
    const { filled, total } = countAround(size, cells, cell, ORTHOGONAL)
    if (isFilled && filled === 0) return false
    if (!isFilled && filled === total) return true
    return isFilled
  })

export const densityOfPattern = (cells: readonly boolean[]): number =>
  cells.filter(Boolean).length / cells.length

export const buildPattern = (
  rng: Rng,
  size: Size,
  density: number,
  smoothing: number,
): boolean[] => {
  const symmetry = rng.next() < 0.4 ? SYMMETRIES[1 + rng.int(2)] : 'none'
  const noise = noisePattern(rng, size, density, symmetry)
  return removeIsolated(size, smoothPattern(size, noise, smoothing))
}
