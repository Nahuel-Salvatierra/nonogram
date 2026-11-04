import type { GameEvent } from '@core/game/events'
import { applyCollectionEvent, type CollectionRecord } from '@core/stats/collection'
import type { Persistence } from '@services/storage/persistence'
import { createStore, type StoreApi } from 'zustand/vanilla'

export type PuzzleProgress = Readonly<Record<string, number>>

export type CollectionStoreState = {
  readonly record: CollectionRecord
  readonly progress: PuzzleProgress
  readonly hydrate: (record: CollectionRecord, progress: PuzzleProgress) => void
  readonly apply: (event: GameEvent, now: number) => void
  readonly setProgress: (puzzleId: string, value: number | null) => void
}

export type CollectionStore = StoreApi<CollectionStoreState>

const withoutKey = (progress: PuzzleProgress, key: string): PuzzleProgress =>
  Object.fromEntries(Object.entries(progress).filter(([id]) => id !== key))

export const createCollectionStore = (persistence: Persistence): CollectionStore =>
  createStore<CollectionStoreState>()((set, get) => ({
    record: {},
    progress: {},
    hydrate: (record, progress) => set({ record, progress }),
    apply: (event, now) => {
      const before = get().record
      const record = applyCollectionEvent(before, event, now)
      if (record === before) return
      set({ record })
      void persistence.saveCollection(record)
    },
    setProgress: (puzzleId, value) => {
      const { progress } = get()
      if (value === null) {
        if (puzzleId in progress) set({ progress: withoutKey(progress, puzzleId) })
        return
      }
      if (progress[puzzleId] !== value) set({ progress: { ...progress, [puzzleId]: value } })
    },
  }))
