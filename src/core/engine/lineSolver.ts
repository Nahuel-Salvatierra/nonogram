import type { Clue } from './clues'
import type { CellState, Line } from './grid'
import { buildPlacementTable } from './placements'

export type LineDeduction = (line: Line, clue: Clue) => CellState[] | null

const resolveCell = (current: CellState, canFill: boolean, canEmpty: boolean): CellState => {
  if (canFill && !canEmpty) return 'filled'
  if (canEmpty && !canFill) return 'crossed'
  return current
}

export const solveLine: LineDeduction = (line, clue) => {
  const table = buildPlacementTable(line, clue)
  if (!table.canFrom(0, 0)) return null
  const { n, k } = table
  const canFill = new Array<boolean>(n).fill(false)
  const canEmpty = new Array<boolean>(n).fill(false)
  const reach = new Uint8Array((k + 1) * (n + 1))
  reach[0] = 1

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= k; j++) {
      if (reach[j * (n + 1) + i] === 0 || !table.canFrom(j, i)) continue
      if (j === k) {
        for (let c = i; c < n; c++) canEmpty[c] = true
        continue
      }
      if (i < n && line[i] !== 'filled' && table.canFrom(j, i + 1)) {
        canEmpty[i] = true
        reach[j * (n + 1) + i + 1] = 1
      }
      const next = table.afterBlock(j, i)
      if (table.canPlace(j, i) && table.canFrom(j + 1, next)) {
        const end = i + clue[j]
        for (let c = i; c < end; c++) canFill[c] = true
        if (end < n) canEmpty[end] = true
        reach[(j + 1) * (n + 1) + next] = 1
      }
    }
  }

  return line.map((cell, c) => resolveCell(cell, canFill[c], canEmpty[c]))
}

export const changedCells = (before: Line, after: Line): number[] =>
  before.flatMap((cell, i) => (cell === after[i] ? [] : [i]))
