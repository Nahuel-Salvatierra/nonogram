import { ratePuzzle } from '@core/engine/analyzer'
import { deriveClues } from '@core/engine/clues'
import { isDifficultyAvailable } from '@core/engine/difficulty'
import { countSolutions } from '@core/engine/search'
import { decodeSolution } from '@core/engine/text'
import { ANALYZER_VERSION } from '@core/engine/versions'
import { describe, expect, it } from 'vitest'
import {
  COLLECTION,
  findCollectionPuzzle,
  nextCollectionPuzzle,
  PACKS_ANALYZER_VERSION,
} from './collection'

const puzzles = COLLECTION.flatMap((pack) => pack.puzzles)

describe('collection packs', () => {
  it('was built with the current analyzer', () => {
    expect(PACKS_ANALYZER_VERSION).toBe(ANALYZER_VERSION)
  })

  it('has 20 puzzles of 5x5, 67 of 10x10 and 18 of 15x15', () => {
    expect(puzzles.filter((puzzle) => puzzle.sizeId === '5x5')).toHaveLength(20)
    expect(puzzles.filter((puzzle) => puzzle.sizeId === '10x10')).toHaveLength(67)
    expect(puzzles.filter((puzzle) => puzzle.sizeId === '15x15')).toHaveLength(18)
  })

  it.each(puzzles.map((puzzle) => [puzzle.id, puzzle] as const))(
    '%s is unique, logically solvable and correctly rated',
    (_, puzzle) => {
      const clues = deriveClues(puzzle.size, decodeSolution(puzzle.solution))
      const rating = ratePuzzle(puzzle.size, clues)
      expect(rating.isSolvable).toBe(true)
      expect(rating.difficulty).toBe(puzzle.difficulty)
      expect(isDifficultyAvailable(puzzle.sizeId, puzzle.difficulty)).toBe(true)
      expect(countSolutions(puzzle.size, clues)).toBe(1)
    },
  )
})

describe('collection lookup', () => {
  it('finds puzzles by id and walks to the next one of the same size', () => {
    const [first, second] = COLLECTION[0].puzzles
    expect(findCollectionPuzzle(first.id)).toBe(first)
    expect(nextCollectionPuzzle(first.id)).toBe(second)
    expect(findCollectionPuzzle('missing/id')).toBeNull()
  })

  it('returns null after the last puzzle of a size', () => {
    const last = puzzles.filter((puzzle) => puzzle.sizeId === '10x10').at(-1)
    expect(last && nextCollectionPuzzle(last.id)).toBeNull()
  })
})
