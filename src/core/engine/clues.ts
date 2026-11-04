import { colCells, rowCells, type Line, type Size } from './grid'

export type Clue = readonly number[]

export type Clues = { readonly rows: readonly Clue[]; readonly cols: readonly Clue[] }

export type Solution = readonly boolean[]

export const lineClue = (filled: readonly boolean[]): number[] => {
  const blocks: number[] = []
  let run = 0
  for (const isFilled of filled) {
    if (isFilled) run++
    else if (run > 0) {
      blocks.push(run)
      run = 0
    }
  }
  if (run > 0) blocks.push(run)
  return blocks
}

export const deriveClues = (size: Size, solution: Solution): Clues => ({
  rows: Array.from({ length: size.rows }, (_, row) =>
    lineClue(rowCells(size, row).map((i) => solution[i])),
  ),
  cols: Array.from({ length: size.cols }, (_, col) =>
    lineClue(colCells(size, col).map((i) => solution[i])),
  ),
})

export const cluesEqual = (a: Clue, b: Clue): boolean =>
  a.length === b.length && a.every((value, i) => value === b[i])

export const lineMatchesClue = (line: Line, clue: Clue): boolean =>
  cluesEqual(lineClue(line.map((cell) => cell === 'filled')), clue)

export const clueSum = (clue: Clue): number => clue.reduce((sum, block) => sum + block, 0)

export const minLength = (clue: Clue): number =>
  clue.length === 0 ? 0 : clueSum(clue) + clue.length - 1

export const filledCount = (solution: Solution): number =>
  solution.reduce((count, isFilled) => count + (isFilled ? 1 : 0), 0)
