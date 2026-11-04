import { describe, expect, it } from 'vitest'
import type { GameEvent, GameSummary } from '../game/events'
import {
  applyStatsEvent,
  averageTimeMs,
  createEmptyStats,
  isNewRecord,
  kindStats,
  statsForSize,
} from './stats'

const summary = (overrides: Partial<GameSummary> = {}): GameSummary => ({
  gameId: 'g1',
  puzzleId: 'quick-1-v1',
  mode: 'quick',
  sizeId: '10x10',
  difficulty: 'medium',
  elapsedMs: 60_000,
  mistakes: 0,
  hintsUsed: 0,
  ...overrides,
})

const started: GameEvent = {
  type: 'gameStarted',
  gameId: 'g1',
  puzzleId: 'quick-1-v1',
  mode: 'quick',
  sizeId: '10x10',
  difficulty: 'medium',
}

const apply = (events: readonly GameEvent[]) => events.reduce(applyStatsEvent, createEmptyStats())

describe('stats', () => {
  it('counts started, completed and abandoned games by size and difficulty', () => {
    const stats = apply([
      started,
      { type: 'gameCompleted', summary: summary() },
      started,
      { type: 'gameAbandoned', summary: summary(), progress: 0.2 },
    ])
    expect(kindStats(stats, '10x10', 'medium')).toMatchObject({
      started: 2,
      completed: 1,
      abandoned: 1,
      perfectCompleted: 1,
    })
    expect(stats.global.started).toBe(2)
    expect(kindStats(stats, '5x5', 'medium').started).toBe(0)
  })

  it('only counts best times without hints and perfect games without mistakes or hints', () => {
    const stats = apply([
      { type: 'gameCompleted', summary: summary({ elapsedMs: 30_000, hintsUsed: 1 }) },
      { type: 'gameCompleted', summary: summary({ elapsedMs: 50_000, mistakes: 2 }) },
    ])
    const medium = kindStats(stats, '10x10', 'medium')
    expect(medium.bestTimeMs).toBe(50_000)
    expect(medium.perfectCompleted).toBe(0)
    expect(averageTimeMs(medium)).toBe(40_000)
  })

  it('detects new records', () => {
    const before = createEmptyStats()
    const after = applyStatsEvent(before, { type: 'gameCompleted', summary: summary() })
    expect(isNewRecord(before, after, '10x10', 'medium')).toBe(true)
    expect(isNewRecord(after, after, '10x10', 'medium')).toBe(false)
  })

  it('sums the stats of one size', () => {
    const stats = apply([
      { type: 'gameCompleted', summary: summary({ difficulty: 'easy', elapsedMs: 20_000 }) },
      { type: 'gameCompleted', summary: summary({ difficulty: 'hard', elapsedMs: 90_000 }) },
    ])
    expect(statsForSize(stats, '10x10')).toMatchObject({ completed: 2, bestTimeMs: 20_000 })
  })
})
