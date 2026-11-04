import { clueSum, lineMatchesClue } from './clues'
import type { CellState, Line } from './grid'
import type { LineDeduction } from './lineSolver'
import { leftmostStarts, rightmostStarts } from './placements'

const crossesOnly = (line: Line): CellState[] =>
  line.map((cell) => (cell === 'filled' ? 'unknown' : cell))

const completeLine = (line: Line): CellState[] =>
  line.map((cell) => (cell === 'unknown' ? 'crossed' : cell))

export const solveLineSimple: LineDeduction = (line, clue) => {
  const filled = line.filter((cell) => cell === 'filled').length
  if (!line.includes('unknown')) return lineMatchesClue(line, clue) ? [...line] : null
  if (filled === clueSum(clue) && lineMatchesClue(line, clue)) return completeLine(line)

  const relaxed = crossesOnly(line)
  const lefts = leftmostStarts(relaxed, clue)
  const rights = rightmostStarts(relaxed, clue)
  if (lefts === null || rights === null) return null
  const reachable = new Array<boolean>(line.length).fill(false)
  const result = [...line]

  clue.forEach((length, j) => {
    for (let c = lefts[j]; c < rights[j] + length; c++) reachable[c] = true
    for (let c = rights[j]; c < lefts[j] + length; c++) result[c] = 'filled'
  })

  if (result.some((cell, c) => !reachable[c] && cell === 'filled')) return null
  return result.map((cell, c) => (!reachable[c] && cell === 'unknown' ? 'crossed' : cell))
}
