import { describe, expect, it } from 'vitest'
import { ratePuzzle } from './analyzer'
import { deriveClues } from './clues'
import { DIFFICULTIES_BY_SIZE, SIZE_IDS, SIZE_OF } from './difficulty'
import { generatePuzzle, quickPuzzleId } from './generator'
import { inDensityRange } from './profiles'
import { createRng } from './rng'
import { countSolutions } from './search'
import { GENERATOR_VERSION } from './versions'

const cases = SIZE_IDS.flatMap((sizeId) =>
  DIFFICULTIES_BY_SIZE[sizeId].map((difficulty) => [sizeId, difficulty] as const),
)

describe('generatePuzzle', () => {
  it.each(cases)('generates a unique %s %s puzzle of the requested level', (sizeId, difficulty) => {
    const size = SIZE_OF[sizeId]
    const puzzle = generatePuzzle(createRng(`test-${sizeId}-${difficulty}`), size, difficulty)
    expect(puzzle).not.toBeNull()
    if (!puzzle) return
    const clues = deriveClues(size, puzzle.solution)
    const rating = ratePuzzle(size, clues)
    expect(rating.isSolvable).toBe(true)
    expect(rating.difficulty).toBe(difficulty)
    expect(inDensityRange(difficulty, rating.density)).toBe(true)
    expect(countSolutions(size, clues)).toBe(1)
    expect(puzzle.generatorVersion).toBe(GENERATOR_VERSION)
  })

  it('is deterministic for a seed', () => {
    const size = SIZE_OF['10x10']
    const first = generatePuzzle(createRng(99), size, 'medium')
    const second = generatePuzzle(createRng(99), size, 'medium')
    expect(first).toEqual(second)
  })

  it('returns null when attempts run out', () => {
    expect(generatePuzzle(createRng(1), SIZE_OF['10x10'], 'expert', 0)).toBeNull()
  })

  it('builds versioned quick ids', () => {
    expect(quickPuzzleId(42)).toBe(`quick-42-v${GENERATOR_VERSION}`)
  })
})
