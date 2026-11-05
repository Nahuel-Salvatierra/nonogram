import { progressOf } from '@core/game/completion'
import type { GameEvent, GameSummary } from '@core/game/events'
import type { GameState } from '@core/game/types'
import { isNewRecord } from '@core/stats/stats'
import type { AppServices } from '@services/AppServices'
import { nextCollectionPuzzle } from '@services/puzzles/collection'
import type { Meta } from '@services/storage/schemas'
import { createCollectionStore, type CollectionStore } from '../stores/collectionStore'
import { createGameStore, type GameStore } from '../stores/gameStore'
import { createSettingsStore, type SettingsStore } from '../stores/settingsStore'
import { createStatsStore, type StatsStore } from '../stores/statsStore'
import { toAnalyticsEvent } from './analyticsEvents'
import { createBackStack, type BackStack } from './backStack'
import { createEventBus, type EventBus } from './eventBus'
import { isActiveGame, toPersistedGame } from './gamePersistence'
import { createHintBudget } from './hintBudget'

export const SAVE_DEBOUNCE_MS = 300
export const TICK_INTERVAL_MS = 5000

export type AppRuntime = {
  readonly services: AppServices
  readonly bus: EventBus<GameEvent>
  readonly backStack: BackStack
  readonly gameStore: GameStore
  readonly settingsStore: SettingsStore
  readonly statsStore: StatsStore
  readonly collectionStore: CollectionStore
  readonly start: () => Promise<void>
  readonly flushSave: () => Promise<void>
  readonly afterVictory: () => Promise<void>
  readonly dispose: () => void
}

const collectionProgress = (games: readonly GameState[]): Record<string, number> =>
  Object.fromEntries(
    games
      .filter((game) => game.mode === 'collection' && isActiveGame(game))
      .map((game) => [game.puzzleId, progressOf(game)]),
  )

const nextPuzzleIdOf = (summary: GameSummary): string | null =>
  summary.mode === 'collection' ? (nextCollectionPuzzle(summary.puzzleId)?.id ?? null) : null

export const createAppRuntime = (services: AppServices): AppRuntime => {
  const bus = createEventBus<GameEvent>()
  const backStack = createBackStack()
  const settingsStore = createSettingsStore(services.persistence)
  const statsStore = createStatsStore(services.persistence)
  const collectionStore = createCollectionStore(services.persistence)
  const hintBudget = createHintBudget(services)
  const gameStore = createGameStore({
    services,
    bus,
    getSettings: () => settingsStore.getState().settings,
    getFreeHints: hintBudget.freeHints,
  })
  const cleanups: (() => void)[] = []
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const flushSave = async (): Promise<void> => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = null
    const { game } = gameStore.getState()
    if (isActiveGame(game))
      await services.persistence.saveGame(toPersistedGame(game, services.clock.now()))
  }

  const scheduleSave = (): void => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => void flushSave(), SAVE_DEBOUNCE_MS)
  }

  const onGameEvent = (event: GameEvent): void => {
    const analyticsEvent = toAnalyticsEvent(event)
    if (analyticsEvent) services.analytics.track(analyticsEvent)
    const change = statsStore.getState().apply(event)
    collectionStore.getState().apply(event, services.clock.now())
    if (event.type === 'hintUsed' && !event.isRewarded) void hintBudget.consume()
    if (event.type === 'gameCompleted') {
      const { summary } = event
      const game = gameStore.getState().game
      void services.persistence.removeGame(summary.puzzleId)
      collectionStore.getState().setProgress(summary.puzzleId, null)
      gameStore.getState().finish({
        summary,
        isNewRecord: isNewRecord(change.before, change.after, summary.sizeId, summary.difficulty),
        name: game?.name ?? null,
        solution: game?.solution ?? [],
        nextPuzzleId: nextPuzzleIdOf(summary),
      })
    }
    if (event.type === 'gameAbandoned') {
      void services.persistence.removeGame(event.summary.puzzleId)
      collectionStore.getState().setProgress(event.summary.puzzleId, null)
      gameStore.getState().finish(null)
    }
  }

  const onGameChange = (game: GameState | null): void => {
    if (!isActiveGame(game)) return
    scheduleSave()
    if (game.mode === 'collection')
      collectionStore.getState().setProgress(game.puzzleId, progressOf(game))
  }

  const wire = (): void => {
    cleanups.push(bus.subscribe(onGameEvent))
    cleanups.push(
      gameStore.subscribe((state, previous) => {
        if (state.game !== previous.game) onGameChange(state.game)
      }),
    )
    cleanups.push(
      services.lifecycle.onActiveChange((isActive) => {
        if (isActive) return
        gameStore.getState().dispatch({ type: 'pause' })
        void flushSave()
      }),
    )
    cleanups.push(
      services.lifecycle.onBackButton(() => {
        if (!backStack.handle()) services.lifecycle.exitApp()
      }),
    )
    const tick = setInterval(
      () => gameStore.getState().dispatch({ type: 'tick' }),
      TICK_INTERVAL_MS,
    )
    cleanups.push(() => clearInterval(tick))
  }

  const start = async (): Promise<void> => {
    const [settings, stats, record, games, game, meta] = await Promise.all([
      services.persistence.loadSettings(),
      services.persistence.loadStats(),
      services.persistence.loadCollection(),
      services.persistence.listGames(),
      services.persistence.loadLastGame(),
      services.persistence.loadMeta(),
    ])
    settingsStore.getState().hydrate(settings)
    statsStore.getState().hydrate(stats)
    collectionStore.getState().hydrate(record, collectionProgress(games))
    const nextMeta: Meta = {
      installDate: meta?.installDate ?? services.clock.now(),
      appOpens: (meta?.appOpens ?? 0) + 1,
      hintDay: meta?.hintDay ?? null,
      freeHintsUsed: meta?.freeHintsUsed ?? 0,
    }
    hintBudget.hydrate(nextMeta)
    gameStore.getState().hydrate(game && isActiveGame(game) ? game : null)
    await services.persistence.saveMeta(nextMeta)
    services.analytics.track({ name: 'app_open' })
    wire()
    void services.platform.hideSplash()
    void services.puzzles.refill()
  }

  return {
    services,
    bus,
    backStack,
    gameStore,
    settingsStore,
    statsStore,
    collectionStore,
    start,
    flushSave,
    afterVictory: async () => {
      await services.ads.showInterstitial('afterVictory')
    },
    dispose: () => {
      if (saveTimer) clearTimeout(saveTimer)
      cleanups.splice(0).forEach((cleanup) => cleanup())
    },
  }
}
