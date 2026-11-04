import { createTestServices, type TestServices } from '@services/createTestServices'
import { COLLECTION } from '@services/puzzles/collection'
import { STORAGE_KEYS } from '@services/storage/persistence'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  emptyCellsOf,
  filledCellsOf,
  TEST_FILLED_CELLS,
  TEST_QUICK_PUZZLE,
  TEST_WRONG_CELLS,
} from '../../test/fixtures'
import { createAppRuntime, type AppRuntime } from './createAppRuntime'

const runtimes: AppRuntime[] = []

const startRuntime = async (services: TestServices): Promise<AppRuntime> => {
  const runtime = createAppRuntime(services)
  runtimes.push(runtime)
  await runtime.start()
  return runtime
}

const fillCells = (runtime: AppRuntime, cells: readonly number[]): void => {
  cells.forEach((cell) => {
    runtime.gameStore.getState().dispatch({ type: 'beginStroke', cell })
    runtime.gameStore.getState().dispatch({ type: 'endStroke' })
  })
}

const [FIRST_PUZZLE, SECOND_PUZZLE] = COLLECTION[0].puzzles
const DAY_ONE = new Date(2026, 9, 3, 10, 0).getTime()
const DAY_TWO = new Date(2026, 9, 4, 9, 0).getTime()

afterEach(() => {
  runtimes.splice(0).forEach((runtime) => runtime.dispose())
})

describe('app runtime', () => {
  it('plays a quick game: updates stats, removes the saved game and exposes the result', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await startRuntime(services)
    await runtime.gameStore.getState().startQuickGame('5x5', 'easy')
    services.setNow(61_000)
    fillCells(runtime, TEST_FILLED_CELLS)
    await runtime.flushSave()

    const { game, lastResult } = runtime.gameStore.getState()
    expect(game).toBeNull()
    expect(lastResult?.summary).toMatchObject({
      mode: 'quick',
      sizeId: '5x5',
      difficulty: 'easy',
      elapsedMs: 60_000,
      mistakes: 0,
    })
    expect(lastResult?.isNewRecord).toBe(true)
    expect(lastResult?.nextPuzzleId).toBeNull()
    expect(runtime.statsStore.getState().stats.bySize['5x5'].easy).toMatchObject({
      started: 1,
      completed: 1,
    })
    expect(await services.persistence.listGames()).toEqual([])
    expect(services.analytics.events.map((event) => event.name)).toEqual([
      'app_open',
      'game_started',
      'game_completed',
    ])
  })

  it('completes a collection puzzle and points to the next one', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await startRuntime(services)
    await runtime.gameStore.getState().openCollectionPuzzle(FIRST_PUZZLE.id)
    fillCells(runtime, filledCellsOf(FIRST_PUZZLE.solution))

    const { lastResult } = runtime.gameStore.getState()
    expect(lastResult?.name).toBe(FIRST_PUZZLE.name)
    expect(lastResult?.nextPuzzleId).toBe(SECOND_PUZZLE.id)
    expect(runtime.collectionStore.getState().record[FIRST_PUZZLE.id]?.status).toBe('completed')
    expect((await services.persistence.loadCollection())[FIRST_PUZZLE.id]?.status).toBe('completed')
  })

  it('keeps collection progress per puzzle when switching puzzles', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await startRuntime(services)
    await runtime.gameStore.getState().openCollectionPuzzle(FIRST_PUZZLE.id)
    const [firstCell] = filledCellsOf(FIRST_PUZZLE.solution)
    fillCells(runtime, [firstCell])
    await runtime.gameStore.getState().openCollectionPuzzle(SECOND_PUZZLE.id)
    expect(runtime.gameStore.getState().game?.puzzleId).toBe(SECOND_PUZZLE.id)
    expect(runtime.collectionStore.getState().progress[FIRST_PUZZLE.id]).toBeGreaterThan(0)

    await runtime.gameStore.getState().openCollectionPuzzle(FIRST_PUZZLE.id)
    const resumed = runtime.gameStore.getState().game
    expect(resumed?.status).toBe('paused')
    expect(resumed?.cells[firstCell]).toBe('filled')
    expect(runtime.statsStore.getState().stats.global).toMatchObject({ started: 2, abandoned: 0 })
  })

  it('restores the last game paused after restart', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const first = await startRuntime(services)
    await first.gameStore.getState().startQuickGame('5x5', 'medium')
    fillCells(first, [1])
    services.setNow(11_000)
    await first.flushSave()
    first.dispose()

    services.setNow(500_000)
    const second = await startRuntime(services)
    const restored = second.gameStore.getState().game
    expect(restored?.status).toBe('paused')
    expect(restored?.cells[1]).toBe('filled')
    expect(restored?.elapsedMs).toBe(10_000)
    expect(restored?.runningSince).toBeNull()
  })

  it('pauses and saves when the app goes to background', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await startRuntime(services)
    await runtime.gameStore.getState().startQuickGame('5x5', 'medium')
    services.setNow(6_000)
    services.lifecycle.setActive(false)
    await runtime.flushSave()
    expect(runtime.gameStore.getState().game?.status).toBe('paused')
    const saved = await services.persistence.loadLastGame()
    expect(saved?.elapsedMs).toBe(5_000)
  })

  it('saves a lost collection game and restores it lost', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const first = await startRuntime(services)
    await first.gameStore.getState().openCollectionPuzzle(FIRST_PUZZLE.id)
    fillCells(first, emptyCellsOf(FIRST_PUZZLE.solution).slice(0, 3))
    await first.flushSave()
    expect(first.gameStore.getState().game?.status).toBe('lost')
    expect(services.analytics.events.map((event) => event.name)).toContain('game_lost')
    expect(first.statsStore.getState().stats.global).toMatchObject({ started: 1, abandoned: 0 })
    first.dispose()

    const second = await startRuntime(services)
    expect(second.gameStore.getState().game?.status).toBe('lost')
  })

  it('abandons a lost quick game when starting another one', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await startRuntime(services)
    await runtime.gameStore.getState().startQuickGame('5x5', 'easy')
    fillCells(runtime, TEST_WRONG_CELLS)
    expect(runtime.gameStore.getState().game?.status).toBe('lost')
    await runtime.gameStore.getState().startQuickGame('5x5', 'easy')
    expect(runtime.statsStore.getState().stats.global).toMatchObject({ started: 2, abandoned: 1 })
  })

  it('abandons an active quick game when starting another one', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await startRuntime(services)
    await runtime.gameStore.getState().startQuickGame('5x5', 'easy')
    await runtime.gameStore.getState().startQuickGame('5x5', 'easy')
    const stats = runtime.statsStore.getState().stats.global
    expect(stats).toMatchObject({ started: 2, abandoned: 1 })
    expect(runtime.gameStore.getState().game?.status).toBe('playing')
  })

  it('routes the back button to the top handler or exits', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await startRuntime(services)
    const calls: string[] = []
    const pop = runtime.backStack.push(() => calls.push('screen'))
    services.lifecycle.pressBack()
    pop()
    services.lifecycle.pressBack()
    expect(calls).toEqual(['screen'])
    expect(services.lifecycle.exitCount()).toBe(1)
  })

  it('shares three free hints per day across games and persists them', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    services.setNow(DAY_ONE)
    const first = await startRuntime(services)
    const store = first.gameStore
    await store.getState().startQuickGame('5x5', 'easy')
    store.getState().requestHint()
    store.getState().requestHint()
    await store.getState().startQuickGame('5x5', 'easy')
    expect(store.getState().game?.hintsRemaining).toBe(1)

    store.getState().requestHint()
    store.getState().requestHint()
    expect(store.getState().game).toMatchObject({
      hintsUsed: 1,
      hintsRemaining: 0,
      lastHint: { kind: 'exhausted' },
    })
    await vi.waitFor(async () =>
      expect(await services.persistence.loadMeta()).toMatchObject({
        hintDay: '2026-10-03',
        freeHintsUsed: 3,
      }),
    )
    first.dispose()

    services.setNow(DAY_TWO)
    const second = await startRuntime(services)
    await second.gameStore.getState().startQuickGame('5x5', 'easy')
    expect(second.gameStore.getState().game?.hintsRemaining).toBe(3)
  })

  it('refreshes the free hints of an open game when the day changes', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE, {
      [STORAGE_KEYS.meta]: JSON.stringify({
        schemaVersion: 2,
        data: { installDate: 0, appOpens: 1, hintDay: '2026-10-03', freeHintsUsed: 3 },
      }),
    })
    services.setNow(DAY_ONE)
    const runtime = await startRuntime(services)
    await runtime.gameStore.getState().startQuickGame('5x5', 'easy')
    expect(runtime.gameStore.getState().game?.hintsRemaining).toBe(0)

    services.setNow(DAY_TWO)
    runtime.gameStore.getState().requestHint()
    expect(runtime.gameStore.getState().game).toMatchObject({ hintsUsed: 1, hintsRemaining: 2 })
  })

  it('counts app opens in meta', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    ;(await startRuntime(services)).dispose()
    await startRuntime(services)
    expect((await services.persistence.loadMeta())?.appOpens).toBe(2)
  })
})
