import { describe, expect, it } from 'vitest'
import type { GameEvent, GameSummary } from '../game/events'
import { applyCollectionEvent, completedCount, IN_PROGRESS } from './collection'

const summary = (overrides: Partial<GameSummary> = {}): GameSummary => ({
  gameId: 'g1',
  puzzleId: 'animals/cat',
  mode: 'collection',
  sizeId: '10x10',
  difficulty: 'easy',
  elapsedMs: 90_000,
  mistakes: 0,
  hintsUsed: 0,
  ...overrides,
})

const started = (mode: 'collection' | 'quick'): GameEvent => ({
  type: 'gameStarted',
  gameId: 'g1',
  puzzleId: 'animals/cat',
  mode,
  sizeId: '10x10',
  difficulty: 'easy',
})

describe('collection record', () => {
  it('marks collection puzzles in progress when started', () => {
    expect(applyCollectionEvent({}, started('collection'), 5)).toEqual({
      'animals/cat': IN_PROGRESS,
    })
    expect(applyCollectionEvent({}, started('quick'), 5)).toEqual({})
  })

  it('keeps the best time across completions', () => {
    const first = applyCollectionEvent({}, { type: 'gameCompleted', summary: summary() }, 10)
    const second = applyCollectionEvent(
      first,
      { type: 'gameCompleted', summary: summary({ elapsedMs: 120_000 }) },
      20,
    )
    expect(second['animals/cat']).toEqual({
      status: 'completed',
      bestTimeMs: 90_000,
      completedAt: 20,
    })
  })

  it('does not downgrade a completed puzzle when replayed and abandoned', () => {
    const completed = applyCollectionEvent({}, { type: 'gameCompleted', summary: summary() }, 10)
    const replayed = applyCollectionEvent(completed, started('collection'), 11)
    const abandoned = applyCollectionEvent(
      replayed,
      { type: 'gameAbandoned', summary: summary(), progress: 0.5 },
      12,
    )
    expect(abandoned['animals/cat']?.status).toBe('completed')
  })

  it('removes in-progress puzzles when abandoned', () => {
    const inProgress = applyCollectionEvent({}, started('collection'), 5)
    const abandoned = applyCollectionEvent(
      inProgress,
      { type: 'gameAbandoned', summary: summary(), progress: 0.1 },
      6,
    )
    expect(abandoned).toEqual({})
  })

  it('counts completed puzzles', () => {
    const record = applyCollectionEvent({}, { type: 'gameCompleted', summary: summary() }, 10)
    expect(completedCount(record, ['animals/cat', 'animals/dog'])).toBe(1)
  })
})
