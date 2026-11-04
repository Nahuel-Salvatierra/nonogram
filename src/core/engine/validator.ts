import { lineMatchesClue, type Clues, type Solution } from './clues'
import { colCells, readLine, rowCells, type CellState, type Size } from './grid'

export type CompletedLines = {
  readonly rows: readonly boolean[]
  readonly cols: readonly boolean[]
}

export const isWrongCell = (state: CellState, isFilled: boolean): boolean =>
  (state === 'filled' && !isFilled) || (state === 'crossed' && isFilled)

export const findErrors = (cells: readonly CellState[], solution: Solution): number[] =>
  cells.flatMap((state, i) => (isWrongCell(state, solution[i]) ? [i] : []))

export const completedLines = (
  size: Size,
  clues: Clues,
  cells: readonly CellState[],
): CompletedLines => ({
  rows: clues.rows.map((clue, row) => lineMatchesClue(readLine(cells, rowCells(size, row)), clue)),
  cols: clues.cols.map((clue, col) => lineMatchesClue(readLine(cells, colCells(size, col)), clue)),
})

export const isSolved = (cells: readonly CellState[], solution: Solution): boolean =>
  cells.every((state, i) => (state === 'filled') === solution[i])

export const solutionCells = (solution: Solution): CellState[] =>
  solution.map((isFilled) => (isFilled ? 'filled' : 'crossed'))
