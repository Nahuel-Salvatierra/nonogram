import { deriveClues, type Clues, type Solution } from '../clues'
import type { Size } from '../grid'
import { parsePattern } from '../text'

export type FixturePuzzle = {
  readonly size: Size
  readonly solution: Solution
  readonly clues: Clues
}

export const fixture = (rows: readonly string[]): FixturePuzzle => {
  const pattern = parsePattern(rows)
  if (pattern === null) throw new Error(`Invalid fixture: ${rows.join('/')}`)
  return { ...pattern, clues: deriveClues(pattern.size, pattern.solution) }
}

export const PLAN_EXAMPLE = fixture(['.###.', '.#.#.', '#####', '..#..', '..##.'])

export const DIAGONAL_2X2 = fixture(['#.', '.#'])

export const NEEDS_LINE_SOLVER = fixture(['...#.', '#...#', '.####', '....#', '##...'])

export const NEEDS_PROBING = fixture(['#.###.', '...##.', '.##...', '..#.##', '.####.', '##.#..'])

export const NEEDS_PROBING_10 = fixture([
  '#####..##.',
  '##.##.#..#',
  '##.##.....',
  '####.##...',
  '#....####.',
  '#.##..####',
  '..#.#..###',
  '#...####.#',
  '##.##..##.',
  '##....##.#',
])
