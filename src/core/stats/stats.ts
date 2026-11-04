import { DIFFICULTIES, type Difficulty, type SizeId } from '../engine/difficulty'
import type { GameEvent, GameSummary } from '../game/events'

export type KindStats = {
  readonly started: number
  readonly completed: number
  readonly abandoned: number
  readonly totalTimeMs: number
  readonly bestTimeMs: number | null
  readonly perfectCompleted: number
}

export type StatsBySize = Readonly<Record<SizeId, Readonly<Record<Difficulty, KindStats>>>>

export type Stats = {
  readonly global: KindStats
  readonly bySize: StatsBySize
}

export const EMPTY_KIND_STATS: KindStats = {
  started: 0,
  completed: 0,
  abandoned: 0,
  totalTimeMs: 0,
  bestTimeMs: null,
  perfectCompleted: 0,
}

const emptyByDifficulty = (): Record<Difficulty, KindStats> => ({
  easy: EMPTY_KIND_STATS,
  medium: EMPTY_KIND_STATS,
  hard: EMPTY_KIND_STATS,
  expert: EMPTY_KIND_STATS,
})

export const createEmptyStats = (): Stats => ({
  global: EMPTY_KIND_STATS,
  bySize: {
    '5x5': emptyByDifficulty(),
    '10x10': emptyByDifficulty(),
    '15x15': emptyByDifficulty(),
  },
})

const isBetterTime = (best: number | null, time: number): boolean => best === null || time < best

const recordStart = (stats: KindStats): KindStats => ({ ...stats, started: stats.started + 1 })

const recordCompletion = (stats: KindStats, summary: GameSummary): KindStats => {
  const countsForBest = summary.hintsUsed === 0
  return {
    ...stats,
    completed: stats.completed + 1,
    totalTimeMs: stats.totalTimeMs + summary.elapsedMs,
    bestTimeMs:
      countsForBest && isBetterTime(stats.bestTimeMs, summary.elapsedMs)
        ? summary.elapsedMs
        : stats.bestTimeMs,
    perfectCompleted:
      stats.perfectCompleted + (summary.mistakes === 0 && summary.hintsUsed === 0 ? 1 : 0),
  }
}

const recordAbandon = (stats: KindStats): KindStats => ({
  ...stats,
  abandoned: stats.abandoned + 1,
})

const updateBoth = (
  stats: Stats,
  sizeId: SizeId,
  difficulty: Difficulty,
  update: (current: KindStats) => KindStats,
): Stats => ({
  global: update(stats.global),
  bySize: {
    ...stats.bySize,
    [sizeId]: { ...stats.bySize[sizeId], [difficulty]: update(stats.bySize[sizeId][difficulty]) },
  },
})

export const applyStatsEvent = (stats: Stats, event: GameEvent): Stats => {
  switch (event.type) {
    case 'gameStarted':
      return updateBoth(stats, event.sizeId, event.difficulty, recordStart)
    case 'gameCompleted':
      return updateBoth(stats, event.summary.sizeId, event.summary.difficulty, (current) =>
        recordCompletion(current, event.summary),
      )
    case 'gameAbandoned':
      return updateBoth(stats, event.summary.sizeId, event.summary.difficulty, recordAbandon)
    default:
      return stats
  }
}

export const averageTimeMs = (stats: KindStats): number | null =>
  stats.completed === 0 ? null : Math.round(stats.totalTimeMs / stats.completed)

export const kindStats = (stats: Stats, sizeId: SizeId, difficulty: Difficulty): KindStats =>
  stats.bySize[sizeId][difficulty]

export const isNewRecord = (
  before: Stats,
  after: Stats,
  sizeId: SizeId,
  difficulty: Difficulty,
): boolean => {
  const previous = kindStats(before, sizeId, difficulty).bestTimeMs
  const current = kindStats(after, sizeId, difficulty).bestTimeMs
  return current !== null && current !== previous
}

export const sumStats = (items: readonly KindStats[]): KindStats =>
  items.reduce(
    (total, item) => ({
      started: total.started + item.started,
      completed: total.completed + item.completed,
      abandoned: total.abandoned + item.abandoned,
      totalTimeMs: total.totalTimeMs + item.totalTimeMs,
      bestTimeMs:
        item.bestTimeMs !== null && isBetterTime(total.bestTimeMs, item.bestTimeMs)
          ? item.bestTimeMs
          : total.bestTimeMs,
      perfectCompleted: total.perfectCompleted + item.perfectCompleted,
    }),
    EMPTY_KIND_STATS,
  )

export const statsForSize = (stats: Stats, sizeId: SizeId): KindStats =>
  sumStats(DIFFICULTIES.map((difficulty) => stats.bySize[sizeId][difficulty]))
