import type { GameState } from '@core/game/types'
import { DEFAULT_SETTINGS, type Settings } from '@core/settings'
import type { CollectionRecord } from '@core/stats/collection'
import { createEmptyStats, type Stats } from '@core/stats/stats'
import { createEmptyBuffer, type QuickBuffer } from '../puzzles/quickBuffer'
import { loadDocument, removeDocument, saveDocument, type DocumentSpec } from './document'
import { decodeGame, encodeGame } from './gameCodec'
import {
  BUFFER_MIGRATIONS,
  COLLECTION_MIGRATIONS,
  GAMES_MIGRATIONS,
  LAST_GAME_MIGRATIONS,
  META_MIGRATIONS,
  SETTINGS_MIGRATIONS,
  STATS_MIGRATIONS,
} from './migrations'
import {
  BUFFER_VERSION,
  COLLECTION_VERSION,
  collectionSchema,
  GAMES_VERSION,
  LAST_GAME_VERSION,
  lastGameIdSchema,
  META_VERSION,
  metaSchema,
  quickBufferSchema,
  savedGamesSchema,
  SETTINGS_VERSION,
  settingsSchema,
  STATS_VERSION,
  statsSchema,
  type Meta,
  type SavedGame,
  type SavedGames,
} from './schemas'
import type { StorageAdapter } from './StorageAdapter'

export const STORAGE_KEYS = {
  settings: 'settings',
  stats: 'stats',
  meta: 'meta',
  collection: 'collection',
  games: 'games',
  lastGameId: 'lastGameId',
  quickBuffer: 'quickBuffer',
} as const

export const MAX_SAVED_GAMES = 10

const spec = <T>(
  key: string,
  version: number,
  schema: DocumentSpec<T>['schema'],
  migrations: DocumentSpec<T>['migrations'],
): DocumentSpec<T> => ({ key, version, schema, migrations })

const SETTINGS_SPEC = spec<Settings>(
  STORAGE_KEYS.settings,
  SETTINGS_VERSION,
  settingsSchema,
  SETTINGS_MIGRATIONS,
)
const STATS_SPEC = spec<Stats>(STORAGE_KEYS.stats, STATS_VERSION, statsSchema, STATS_MIGRATIONS)
const META_SPEC = spec<Meta>(STORAGE_KEYS.meta, META_VERSION, metaSchema, META_MIGRATIONS)
const COLLECTION_SPEC = spec<CollectionRecord>(
  STORAGE_KEYS.collection,
  COLLECTION_VERSION,
  collectionSchema,
  COLLECTION_MIGRATIONS,
)
const GAMES_SPEC = spec<SavedGames>(
  STORAGE_KEYS.games,
  GAMES_VERSION,
  savedGamesSchema,
  GAMES_MIGRATIONS,
)
const LAST_GAME_SPEC = spec<string>(
  STORAGE_KEYS.lastGameId,
  LAST_GAME_VERSION,
  lastGameIdSchema,
  LAST_GAME_MIGRATIONS,
)
const BUFFER_SPEC = spec<QuickBuffer>(
  STORAGE_KEYS.quickBuffer,
  BUFFER_VERSION,
  quickBufferSchema,
  BUFFER_MIGRATIONS,
)

export interface Persistence {
  loadSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>
  loadStats(): Promise<Stats>
  saveStats(stats: Stats): Promise<void>
  loadMeta(): Promise<Meta | null>
  saveMeta(meta: Meta): Promise<void>
  loadCollection(): Promise<CollectionRecord>
  saveCollection(record: CollectionRecord): Promise<void>
  listGames(): Promise<GameState[]>
  loadGame(puzzleId: string): Promise<GameState | null>
  loadLastGame(): Promise<GameState | null>
  saveGame(game: GameState): Promise<void>
  removeGame(puzzleId: string): Promise<void>
  loadQuickBuffer(): Promise<QuickBuffer>
  saveQuickBuffer(buffer: QuickBuffer): Promise<void>
}

const decodeAll = (games: readonly SavedGame[]): GameState[] =>
  games.flatMap((saved) => decodeGame(saved) ?? [])

export const createPersistence = (storage: StorageAdapter): Persistence => {
  let gamesCache: Promise<readonly SavedGame[]> | null = null

  const loadSavedGames = (): Promise<readonly SavedGame[]> => {
    gamesCache ??= loadDocument(storage, GAMES_SPEC).then((doc) => doc?.games ?? [])
    return gamesCache
  }

  const writeSavedGames = async (games: readonly SavedGame[]): Promise<void> => {
    gamesCache = Promise.resolve(games)
    await saveDocument(storage, GAMES_SPEC, { games })
  }

  const loadGame = async (puzzleId: string): Promise<GameState | null> => {
    const saved = (await loadSavedGames()).find((game) => game.puzzleId === puzzleId)
    return saved ? decodeGame(saved) : null
  }

  return {
    loadSettings: async () => ({
      ...DEFAULT_SETTINGS,
      ...(await loadDocument(storage, SETTINGS_SPEC)),
    }),
    saveSettings: (settings) => saveDocument(storage, SETTINGS_SPEC, settings),
    loadStats: async () => (await loadDocument(storage, STATS_SPEC)) ?? createEmptyStats(),
    saveStats: (stats) => saveDocument(storage, STATS_SPEC, stats),
    loadMeta: () => loadDocument(storage, META_SPEC),
    saveMeta: (meta) => saveDocument(storage, META_SPEC, meta),
    loadCollection: async () => (await loadDocument(storage, COLLECTION_SPEC)) ?? {},
    saveCollection: (record) => saveDocument(storage, COLLECTION_SPEC, record),
    listGames: async () => decodeAll(await loadSavedGames()),
    loadGame,
    loadLastGame: async () => {
      const lastId = await loadDocument(storage, LAST_GAME_SPEC)
      return lastId === null ? null : loadGame(lastId)
    },
    saveGame: async (game) => {
      const others = (await loadSavedGames()).filter((saved) => saved.puzzleId !== game.puzzleId)
      await writeSavedGames([encodeGame(game), ...others].slice(0, MAX_SAVED_GAMES))
      await saveDocument(storage, LAST_GAME_SPEC, game.puzzleId)
    },
    removeGame: async (puzzleId) => {
      const games = await loadSavedGames()
      await writeSavedGames(games.filter((saved) => saved.puzzleId !== puzzleId))
      if ((await loadDocument(storage, LAST_GAME_SPEC)) === puzzleId) {
        await removeDocument(storage, STORAGE_KEYS.lastGameId)
      }
    },
    loadQuickBuffer: async () => (await loadDocument(storage, BUFFER_SPEC)) ?? createEmptyBuffer(),
    saveQuickBuffer: (buffer) => saveDocument(storage, BUFFER_SPEC, buffer),
  }
}
