import type { Difficulty } from './difficulty'

export type Tier = 1 | 2 | 3 | 4

export type SolverTier = 1 | 2 | 4

export const EASY_MIN_FIRST_PASS = 0.25

export const DEEP_PROPAGATION = { minRounds: 11, maxFirstPass: 0.2 } as const

export type RatingMetrics = {
  readonly maxTier: Tier
  readonly firstPassRatio: number
}

export type GenerationProfile = {
  readonly density: readonly [number, number]
  readonly maxTier: SolverTier
  readonly smoothing: number
  readonly maxAttempts: number
}

export const PROFILES: Readonly<Record<Difficulty, GenerationProfile>> = {
  easy: { density: [0.55, 0.75], maxTier: 1, smoothing: 3, maxAttempts: 200 },
  medium: { density: [0.45, 0.65], maxTier: 2, smoothing: 1, maxAttempts: 2000 },
  hard: { density: [0.4, 0.6], maxTier: 2, smoothing: 0, maxAttempts: 600 },
  expert: { density: [0.4, 0.55], maxTier: 4, smoothing: 0, maxAttempts: 1000 },
}

export const isDeepPropagation = (rounds: number, firstPassRatio: number): boolean =>
  rounds >= DEEP_PROPAGATION.minRounds && firstPassRatio < DEEP_PROPAGATION.maxFirstPass

export const classify = ({ maxTier, firstPassRatio }: RatingMetrics): Difficulty => {
  if (maxTier === 4) return 'expert'
  if (maxTier === 3) return 'hard'
  if (maxTier === 2) return 'medium'
  return firstPassRatio >= EASY_MIN_FIRST_PASS ? 'easy' : 'medium'
}

export const inDensityRange = (difficulty: Difficulty, density: number): boolean => {
  const [min, max] = PROFILES[difficulty].density
  return density >= min && density <= max
}
