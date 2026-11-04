import { ratePuzzle, type Rating } from './analyzer'
import { deriveClues, type Solution } from './clues'
import type { Difficulty } from './difficulty'
import type { Size } from './grid'
import { buildPattern, densityOfPattern } from './patterns'
import { inDensityRange, PROFILES } from './profiles'
import type { Rng } from './rng'
import { ANALYZER_VERSION, GENERATOR_VERSION } from './versions'

export const MAX_FIXUPS = 20

export type GeneratedPuzzle = {
  readonly size: Size
  readonly solution: Solution
  readonly difficulty: Difficulty
  readonly score: number
  readonly generatorVersion: number
  readonly analyzerVersion: number
}

const noiseDensity = (rng: Rng, difficulty: Difficulty): number => {
  const [min, max] = PROFILES[difficulty].density
  return min + rng.next() * (max - min)
}

const accepts = (rating: Rating, difficulty: Difficulty): boolean =>
  rating.difficulty === difficulty && inDensityRange(difficulty, rating.density)

const tryPattern = (
  rng: Rng,
  size: Size,
  difficulty: Difficulty,
  initial: boolean[],
): GeneratedPuzzle | null => {
  const pattern = [...initial]
  const { maxTier } = PROFILES[difficulty]
  for (let fix = 0; fix <= MAX_FIXUPS; fix++) {
    if (densityOfPattern(pattern) === 0) return null
    const rating = ratePuzzle(size, deriveClues(size, pattern), maxTier)
    if (rating.isSolvable) {
      if (!accepts(rating, difficulty)) return null
      return {
        size,
        solution: pattern,
        difficulty,
        score: rating.score,
        generatorVersion: GENERATOR_VERSION,
        analyzerVersion: ANALYZER_VERSION,
      }
    }
    const cell = rating.unresolved[rng.int(rating.unresolved.length)]
    pattern[cell] = !pattern[cell]
  }
  return null
}

export const generatePuzzle = (
  rng: Rng,
  size: Size,
  difficulty: Difficulty,
  maxAttempts = PROFILES[difficulty].maxAttempts,
): GeneratedPuzzle | null => {
  const { smoothing } = PROFILES[difficulty]
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pattern = buildPattern(rng, size, noiseDensity(rng, difficulty), smoothing)
    const puzzle = tryPattern(rng, size, difficulty, pattern)
    if (puzzle) return puzzle
  }
  return null
}

export const quickPuzzleId = (seed: number): string => `quick-${seed}-v${GENERATOR_VERSION}`
