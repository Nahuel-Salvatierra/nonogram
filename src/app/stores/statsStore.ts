import type { GameEvent } from '@core/game/events'
import { applyStatsEvent, createEmptyStats, type Stats } from '@core/stats/stats'
import type { Persistence } from '@services/storage/persistence'
import { createStore, type StoreApi } from 'zustand/vanilla'

export type StatsChange = {
  readonly before: Stats
  readonly after: Stats
}

export type StatsStoreState = {
  readonly stats: Stats
  readonly hydrate: (stats: Stats) => void
  readonly apply: (event: GameEvent) => StatsChange
  readonly reset: () => void
}

export type StatsStore = StoreApi<StatsStoreState>

export const createStatsStore = (persistence: Persistence): StatsStore =>
  createStore<StatsStoreState>()((set, get) => ({
    stats: createEmptyStats(),
    hydrate: (stats) => set({ stats }),
    apply: (event) => {
      const before = get().stats
      const after = applyStatsEvent(before, event)
      if (after !== before) {
        set({ stats: after })
        void persistence.saveStats(after)
      }
      return { before, after }
    },
    reset: () => {
      const stats = createEmptyStats()
      set({ stats })
      void persistence.saveStats(stats)
    },
  }))
