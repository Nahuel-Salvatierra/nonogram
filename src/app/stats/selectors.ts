import { SIZE_IDS, type Difficulty, type SizeId } from '@core/engine/difficulty'
import {
  averageTimeMs,
  statsForSize,
  sumStats,
  type KindStats,
  type Stats,
} from '@core/stats/stats'

export type SizeScope = 'all' | SizeId

export type DifficultyScope = 'all' | Difficulty

export type StatsView = KindStats & {
  readonly averageTimeMs: number | null
}

const scopedStats = (stats: Stats, size: SizeScope, difficulty: DifficultyScope): KindStats => {
  if (difficulty === 'all') return size === 'all' ? stats.global : statsForSize(stats, size)
  if (size === 'all') return sumStats(SIZE_IDS.map((sizeId) => stats.bySize[sizeId][difficulty]))
  return stats.bySize[size][difficulty]
}

export const selectStatsView = (
  stats: Stats,
  size: SizeScope,
  difficulty: DifficultyScope,
): StatsView => {
  const scoped = scopedStats(stats, size, difficulty)
  return { ...scoped, averageTimeMs: averageTimeMs(scoped) }
}

export const bestTimeOf = (stats: Stats, sizeId: SizeId, difficulty: Difficulty): number | null =>
  stats.bySize[sizeId][difficulty].bestTimeMs
