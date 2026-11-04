import { createEmptyStats } from '@core/stats/stats'
import type { Migration } from './document'
import { metaV1DocumentSchema, statsV1DocumentSchema } from './schemas'

export const SETTINGS_MIGRATIONS: readonly Migration[] = []
export const GAMES_MIGRATIONS: readonly Migration[] = []
export const STATS_MIGRATIONS: readonly Migration[] = [
  {
    fromVersion: 1,
    migrate: (document) => {
      const old = statsV1DocumentSchema.safeParse(document)
      if (!old.success) return null
      const { global, bySize } = old.data.data
      return {
        schemaVersion: 2,
        data: { global, bySize: { ...bySize, '15x15': createEmptyStats().bySize['15x15'] } },
      }
    },
  },
]
export const COLLECTION_MIGRATIONS: readonly Migration[] = []
export const BUFFER_MIGRATIONS: readonly Migration[] = []
export const META_MIGRATIONS: readonly Migration[] = [
  {
    fromVersion: 1,
    migrate: (document) => {
      const old = metaV1DocumentSchema.safeParse(document)
      if (!old.success) return null
      return { schemaVersion: 2, data: { ...old.data.data, hintDay: null, freeHintsUsed: 0 } }
    },
  },
]
export const LAST_GAME_MIGRATIONS: readonly Migration[] = []
