import { colOf, indexOf, rowOf, type Axis, type Size } from '@core/engine/grid'

const steps = (from: number, to: number): number[] => {
  const direction = to >= from ? 1 : -1
  return Array.from({ length: Math.abs(to - from) }, (_, i) => from + direction * (i + 1))
}

export const dominantAxis = (size: Size, origin: number, target: number): Axis =>
  Math.abs(colOf(size, target) - colOf(size, origin)) >=
  Math.abs(rowOf(size, target) - rowOf(size, origin))
    ? 'row'
    : 'col'

export const strokeSpan = (
  size: Size,
  origin: number,
  target: number,
  axis: Axis | null,
): number[] => {
  if (target === origin) return []
  const lockedAxis = axis ?? dominantAxis(size, origin, target)
  const row = rowOf(size, origin)
  const col = colOf(size, origin)
  return lockedAxis === 'row'
    ? steps(col, colOf(size, target)).map((c) => indexOf(size, row, c))
    : steps(row, rowOf(size, target)).map((r) => indexOf(size, r, col))
}
