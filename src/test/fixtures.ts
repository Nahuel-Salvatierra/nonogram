import { GENERATOR_VERSION } from '@core/engine/versions'
import type { FixedQuickPuzzle } from '@services/createTestServices'

export const TEST_SOLUTION = ['.###.', '.#.#.', '#####', '..#..', '..##.'].join('')

export const TEST_QUICK_PUZZLE: FixedQuickPuzzle = {
  solution: TEST_SOLUTION,
  score: 100,
  generatorVersion: GENERATOR_VERSION,
}

export const filledCellsOf = (solution: string): number[] =>
  [...solution].flatMap((char, cell) => (char === '#' ? [cell] : []))

export const emptyCellsOf = (solution: string): number[] =>
  [...solution].flatMap((char, cell) => (char === '.' ? [cell] : []))

export const TEST_FILLED_CELLS = filledCellsOf(TEST_SOLUTION)

export const TEST_WRONG_CELLS = emptyCellsOf(TEST_SOLUTION).slice(0, 3)
