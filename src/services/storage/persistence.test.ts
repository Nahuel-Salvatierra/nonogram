import { decodeSolution } from '@core/engine/text'
import { createGame } from '@core/game/createGame'
import { gameReducer } from '@core/game/reducer'
import type { GameAction } from '@core/game/types'
import { DEFAULT_SETTINGS } from '@core/settings'
import { createEmptyStats } from '@core/stats/stats'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { loadDocument, saveDocument, type DocumentSpec } from './document'
import { createMemoryStorage } from './memoryStorage'
import { createPersistence, MAX_SAVED_GAMES, STORAGE_KEYS } from './persistence'

const SOLUTION = decodeSolution(['.###.', '.#.#.', '#####', '..#..', '..##.'].join(''))
const CONTEXT = { now: 10, settings: { autoValidate: true, autoCross: false } }

const sampleGame = (puzzleId = 'tutorial/plan') => {
  const { state } = createGame({
    gameId: `g-${puzzleId}`,
    puzzleId,
    mode: 'collection',
    name: 'Plan',
    sizeId: '5x5',
    difficulty: 'easy',
    solution: SOLUTION,
    now: 5,
  })
  const actions: GameAction[] = [
    { type: 'beginStroke', cell: 1 },
    { type: 'extendStroke', cells: [1, 2, 3] },
    { type: 'endStroke' },
    { type: 'beginStroke', cell: 0 },
    { type: 'endStroke' },
  ]
  return actions.reduce((current, action) => gameReducer(current, action, CONTEXT).state, state)
}

describe('persistence', () => {
  it('returns defaults when nothing is stored', async () => {
    const persistence = createPersistence(createMemoryStorage())
    expect(await persistence.loadSettings()).toEqual(DEFAULT_SETTINGS)
    expect(await persistence.loadStats()).toEqual(createEmptyStats())
    expect(await persistence.loadCollection()).toEqual({})
    expect(await persistence.loadLastGame()).toBeNull()
  })

  it('round-trips games with compact cells and restores the last game', async () => {
    const storage = createMemoryStorage()
    const persistence = createPersistence(storage)
    const game = sampleGame()
    await persistence.saveGame(game)
    const reloaded = createPersistence(storage)
    expect(await reloaded.loadLastGame()).toEqual({ ...game, focusedCell: null })
    expect(storage.snapshot()[STORAGE_KEYS.games]).toContain('"cells":"xfffuuu')
  })

  it('round-trips a lost game', async () => {
    const storage = createMemoryStorage()
    const lostActions: GameAction[] = [4, 5].flatMap((cell) => [
      { type: 'beginStroke', cell },
      { type: 'endStroke' },
    ])
    const lost = lostActions.reduce(
      (current, action) => gameReducer(current, action, CONTEXT).state,
      sampleGame(),
    )
    expect(lost.status).toBe('lost')
    await createPersistence(storage).saveGame(lost)
    expect(await createPersistence(storage).loadLastGame()).toMatchObject({
      status: 'lost',
      mistakes: 3,
    })
  })

  it('keeps only the most recent games', async () => {
    const persistence = createPersistence(createMemoryStorage())
    for (let i = 0; i <= MAX_SAVED_GAMES; i++) await persistence.saveGame(sampleGame(`p/${i}`))
    const games = await persistence.listGames()
    expect(games).toHaveLength(MAX_SAVED_GAMES)
    expect(games[0].puzzleId).toBe(`p/${MAX_SAVED_GAMES}`)
    expect(await persistence.loadGame('p/0')).toBeNull()
  })

  it('removes a game and clears the last game id', async () => {
    const persistence = createPersistence(createMemoryStorage())
    await persistence.saveGame(sampleGame())
    await persistence.removeGame('tutorial/plan')
    expect(await persistence.loadLastGame()).toBeNull()
    expect(await persistence.listGames()).toEqual([])
  })

  it('migrates stats v1 to v2 adding empty 15x15 stats', async () => {
    const empty = createEmptyStats()
    const played = { ...empty.global, started: 3, completed: 2, bestTimeMs: 40_000 }
    const v1 = {
      global: played,
      bySize: { '5x5': empty.bySize['5x5'], '10x10': { ...empty.bySize['10x10'], hard: played } },
    }
    const storage = createMemoryStorage({
      [STORAGE_KEYS.stats]: JSON.stringify({ schemaVersion: 1, data: v1 }),
    })
    expect(await createPersistence(storage).loadStats()).toEqual({
      global: played,
      bySize: { ...v1.bySize, '15x15': empty.bySize['15x15'] },
    })
  })

  it('migrates meta v1 to v2 with a full daily hint budget', async () => {
    const storage = createMemoryStorage({
      [STORAGE_KEYS.meta]: JSON.stringify({
        schemaVersion: 1,
        data: { installDate: 100, appOpens: 4 },
      }),
    })
    expect(await createPersistence(storage).loadMeta()).toEqual({
      installDate: 100,
      appOpens: 4,
      hintDay: null,
      freeHintsUsed: 0,
    })
  })

  it('discards corrupt data and falls back to defaults', async () => {
    const storage = createMemoryStorage({
      [STORAGE_KEYS.settings]: '{not json',
      [STORAGE_KEYS.stats]: JSON.stringify({ schemaVersion: 1, data: { global: 'bad' } }),
      [STORAGE_KEYS.games]: JSON.stringify({ schemaVersion: 99, data: {} }),
    })
    const persistence = createPersistence(storage)
    expect(await persistence.loadSettings()).toEqual(DEFAULT_SETTINGS)
    expect(await persistence.loadStats()).toEqual(createEmptyStats())
    expect(await persistence.listGames()).toEqual([])
    expect(storage.snapshot()).toEqual({})
  })
})

describe('document migrations', () => {
  const v2Schema = z.object({ name: z.string(), showTimer: z.boolean() })
  const v1Schema = z.object({ schemaVersion: z.literal(1), data: z.object({ name: z.string() }) })
  const spec: DocumentSpec<z.infer<typeof v2Schema>> = {
    key: 'sample',
    version: 2,
    schema: v2Schema,
    migrations: [
      {
        fromVersion: 1,
        migrate: (document) => {
          const old = v1Schema.safeParse(document)
          return old.success
            ? { schemaVersion: 2, data: { ...old.data.data, showTimer: true } }
            : null
        },
      },
    ],
  }

  it('migrates a v1 document to v2', async () => {
    const storage = createMemoryStorage({
      sample: JSON.stringify({ schemaVersion: 1, data: { name: 'a' } }),
    })
    expect(await loadDocument(storage, spec)).toEqual({ name: 'a', showTimer: true })
  })

  it('saves documents with their schema version', async () => {
    const storage = createMemoryStorage()
    await saveDocument(storage, spec, { name: 'b', showTimer: false })
    expect(JSON.parse(storage.snapshot().sample ?? '{}')).toEqual({
      schemaVersion: 2,
      data: { name: 'b', showTimer: false },
    })
  })
})
