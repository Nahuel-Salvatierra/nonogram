import type { GameEvent } from '../game/events'

export type PuzzleStatus = 'inProgress' | 'completed'

export type PuzzleRecord = {
  readonly status: PuzzleStatus
  readonly bestTimeMs: number | null
  readonly completedAt: number | null
}

export type CollectionRecord = Readonly<Record<string, PuzzleRecord>>

export const IN_PROGRESS: PuzzleRecord = {
  status: 'inProgress',
  bestTimeMs: null,
  completedAt: null,
}

const withoutKey = (record: CollectionRecord, key: string): CollectionRecord =>
  Object.fromEntries(Object.entries(record).filter(([id]) => id !== key))

export const applyCollectionEvent = (
  record: CollectionRecord,
  event: GameEvent,
  now: number,
): CollectionRecord => {
  if (event.type === 'gameStarted') {
    if (event.mode !== 'collection' || record[event.puzzleId]) return record
    return { ...record, [event.puzzleId]: IN_PROGRESS }
  }
  if (event.type === 'gameCompleted') {
    const { summary } = event
    if (summary.mode !== 'collection') return record
    const best = record[summary.puzzleId]?.bestTimeMs ?? null
    return {
      ...record,
      [summary.puzzleId]: {
        status: 'completed',
        bestTimeMs: best === null ? summary.elapsedMs : Math.min(best, summary.elapsedMs),
        completedAt: now,
      },
    }
  }
  if (event.type === 'gameAbandoned') {
    const current = record[event.summary.puzzleId]
    if (event.summary.mode !== 'collection' || current?.status !== 'inProgress') return record
    return withoutKey(record, event.summary.puzzleId)
  }
  return record
}

export const completedCount = (record: CollectionRecord, ids: readonly string[]): number =>
  ids.filter((id) => record[id]?.status === 'completed').length
