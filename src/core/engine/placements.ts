import type { Clue } from './clues'
import type { Line } from './grid'

export type PlacementTable = {
  readonly n: number
  readonly k: number
  readonly canFrom: (block: number, start: number) => boolean
  readonly canPlace: (block: number, start: number) => boolean
  readonly afterBlock: (block: number, start: number) => number
}

const prefixCount = (line: Line, state: 'filled' | 'crossed'): number[] => {
  const counts = [0]
  for (const cell of line) counts.push(counts[counts.length - 1] + (cell === state ? 1 : 0))
  return counts
}

export const buildPlacementTable = (line: Line, clue: Clue): PlacementTable => {
  const n = line.length
  const k = clue.length
  const filled = prefixCount(line, 'filled')
  const crossed = prefixCount(line, 'crossed')
  const width = n + 1
  const table = new Uint8Array((k + 1) * width)

  const canPlace = (block: number, start: number): boolean => {
    const end = start + clue[block]
    if (end > n || crossed[end] - crossed[start] > 0) return false
    return end === n || line[end] !== 'filled'
  }
  const afterBlock = (block: number, start: number): number => Math.min(start + clue[block] + 1, n)
  const canFrom = (block: number, start: number): boolean => table[block * width + start] === 1

  for (let i = 0; i <= n; i++) table[k * width + i] = filled[n] - filled[i] === 0 ? 1 : 0
  for (let j = k - 1; j >= 0; j--) {
    for (let i = n; i >= 0; i--) {
      const skip = i < n && line[i] !== 'filled' && canFrom(j, i + 1)
      const place = canPlace(j, i) && canFrom(j + 1, afterBlock(j, i))
      table[j * width + i] = skip || place ? 1 : 0
    }
  }

  return { n, k, canFrom, canPlace, afterBlock }
}

export const leftmostStarts = (line: Line, clue: Clue): number[] | null => {
  const table = buildPlacementTable(line, clue)
  if (!table.canFrom(0, 0)) return null
  const starts: number[] = []
  let i = 0
  for (let j = 0; j < table.k; j++) {
    while (!(table.canPlace(j, i) && table.canFrom(j + 1, table.afterBlock(j, i)))) i++
    starts.push(i)
    i = table.afterBlock(j, i)
  }
  return starts
}

export const rightmostStarts = (line: Line, clue: Clue): number[] | null => {
  const reversed = leftmostStarts([...line].reverse(), [...clue].reverse())
  if (reversed === null) return null
  const n = line.length
  return clue.map((length, j) => n - (reversed[clue.length - 1 - j] + length))
}
