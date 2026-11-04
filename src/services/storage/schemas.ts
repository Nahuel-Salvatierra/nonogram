import { DIFFICULTIES, SIZE_IDS } from '@core/engine/difficulty'
import { CELL_STATES } from '@core/engine/grid'
import { TOOLS, type HintInfo, type Move } from '@core/game/types'
import { THEMES, type Settings } from '@core/settings'
import type { CollectionRecord } from '@core/stats/collection'
import type { KindStats, Stats } from '@core/stats/stats'
import { z } from 'zod'
import type { QuickBuffer } from '../puzzles/quickBuffer'
import type { QuickPuzzle } from '../puzzles/quickPuzzle'

export const SETTINGS_VERSION = 1
export const GAMES_VERSION = 1
export const STATS_VERSION = 2
export const COLLECTION_VERSION = 1
export const BUFFER_VERSION = 1
export const META_VERSION = 2
export const LAST_GAME_VERSION = 1

const difficultySchema = z.enum(DIFFICULTIES)
const sizeIdSchema = z.enum(SIZE_IDS)
const cellSchema = z.number().int().min(0)
const cellStateSchema = z.enum(CELL_STATES)

export const settingsSchema: z.ZodType<Settings> = z.object({
  theme: z.enum(THEMES),
  autoValidate: z.boolean(),
  dimCompletedClues: z.boolean(),
  autoCross: z.boolean(),
  highlightLines: z.boolean(),
  showTimer: z.boolean(),
  lastSizeId: sizeIdSchema,
  lastDifficulty: difficultySchema,
})

const moveSchema: z.ZodType<Move> = z.object({
  cell: cellSchema,
  before: cellStateSchema,
  after: cellStateSchema,
  batch: z.number().int().positive(),
})

const hintSchema: z.ZodType<HintInfo> = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('errors'), cells: z.array(cellSchema) }),
  z.object({
    kind: z.literal('line'),
    line: z.object({ axis: z.enum(['row', 'col']), index: z.number().int().min(0) }),
    cells: z.array(cellSchema),
    tier: z.union([z.literal(1), z.literal(2)]),
  }),
  z.object({ kind: z.literal('reveal'), cell: cellSchema }),
  z.object({ kind: z.literal('exhausted') }),
])

export const savedGameSchema = z.object({
  gameId: z.string().min(1),
  puzzleId: z.string().min(1),
  mode: z.enum(['collection', 'quick']),
  name: z.string().nullable(),
  sizeId: sizeIdSchema,
  difficulty: difficultySchema,
  solution: z.string().regex(/^[#.]+$/),
  cells: z.string().regex(/^[ufx]+$/),
  errorCells: z.array(cellSchema),
  hintedCells: z.array(cellSchema),
  tool: z.enum(TOOLS),
  mistakes: z.number().int().min(0),
  countedMistakes: z.array(cellSchema),
  hintsUsed: z.number().int().min(0),
  hintsRemaining: z.number().int().min(0),
  elapsedMs: z.number().min(0),
  runningSince: z.number().nullable(),
  status: z.enum(['playing', 'paused', 'lost', 'completed', 'abandoned']),
  startedAt: z.number(),
  lastPlayedAt: z.number(),
  history: z.array(moveSchema),
  redoStack: z.array(moveSchema),
  restartCount: z.number().int().min(0),
  lastHint: hintSchema.nullable(),
})

export type SavedGame = z.infer<typeof savedGameSchema>

export type SavedGames = { readonly games: readonly SavedGame[] }

export const savedGamesSchema: z.ZodType<SavedGames> = z.object({ games: z.array(savedGameSchema) })

const kindStatsSchema: z.ZodType<KindStats> = z.object({
  started: z.number().int().min(0),
  completed: z.number().int().min(0),
  abandoned: z.number().int().min(0),
  totalTimeMs: z.number().min(0),
  bestTimeMs: z.number().min(0).nullable(),
  perfectCompleted: z.number().int().min(0),
})

const byDifficultySchema = z.object({
  easy: kindStatsSchema,
  medium: kindStatsSchema,
  hard: kindStatsSchema,
  expert: kindStatsSchema,
})

export const statsSchema: z.ZodType<Stats> = z.object({
  global: kindStatsSchema,
  bySize: z.object({
    '5x5': byDifficultySchema,
    '10x10': byDifficultySchema,
    '15x15': byDifficultySchema,
  }),
})

export const statsV1DocumentSchema = z.object({
  schemaVersion: z.literal(1),
  data: z.object({
    global: kindStatsSchema,
    bySize: z.object({ '5x5': byDifficultySchema, '10x10': byDifficultySchema }),
  }),
})

export const collectionSchema: z.ZodType<CollectionRecord> = z.record(
  z.string(),
  z.object({
    status: z.enum(['inProgress', 'completed']),
    bestTimeMs: z.number().min(0).nullable(),
    completedAt: z.number().nullable(),
  }),
)

const quickPuzzleSchema: z.ZodType<QuickPuzzle> = z.object({
  id: z.string(),
  sizeId: sizeIdSchema,
  difficulty: difficultySchema,
  solution: z.string().regex(/^[#.]+$/),
  score: z.number(),
  generatorVersion: z.number().int(),
})

export const quickBufferSchema: z.ZodType<QuickBuffer> = z.object({
  puzzles: z.array(quickPuzzleSchema),
  recentIds: z.array(z.string()),
})

export type Meta = {
  readonly installDate: number
  readonly appOpens: number
  readonly hintDay: string | null
  readonly freeHintsUsed: number
}

export const metaSchema: z.ZodType<Meta> = z.object({
  installDate: z.number(),
  appOpens: z.number().int().min(0),
  hintDay: z.string().nullable(),
  freeHintsUsed: z.number().int().min(0),
})

export const metaV1DocumentSchema = z.object({
  schemaVersion: z.literal(1),
  data: z.object({ installDate: z.number(), appOpens: z.number().int().min(0) }),
})

export const lastGameIdSchema: z.ZodType<string> = z.string().min(1)
