import type { Solution } from '@core/engine/clues'
import type { Difficulty, SizeId } from '@core/engine/difficulty'
import { decodeSolution } from '@core/engine/text'
import { createGame, type NewGameParams } from '@core/game/createGame'
import type { GameEvent, GameSummary } from '@core/game/events'
import { withFreeHints } from '@core/game/hints'
import { gameReducer } from '@core/game/reducer'
import type { GameAction, GameState } from '@core/game/types'
import { gameSettingsOf, type Settings } from '@core/settings'
import type { AppServices } from '@services/AppServices'
import { findCollectionPuzzle } from '@services/puzzles/collection'
import { createStore, type StoreApi } from 'zustand/vanilla'
import type { EventBus } from '../runtime/eventBus'
import { fromPersistedGame, isActiveGame, toPersistedGame } from '../runtime/gamePersistence'

export type VictoryResult = {
  readonly summary: GameSummary
  readonly isNewRecord: boolean
  readonly name: string | null
  readonly solution: Solution
  readonly nextPuzzleId: string | null
}

export type GameStoreState = {
  readonly game: GameState | null
  readonly lastResult: VictoryResult | null
  readonly isStarting: boolean
  readonly hydrate: (game: GameState | null) => void
  readonly openCollectionPuzzle: (puzzleId: string) => Promise<boolean>
  readonly startQuickGame: (sizeId: SizeId, difficulty: Difficulty) => Promise<void>
  readonly dispatch: (action: GameAction) => void
  readonly requestHint: () => void
  readonly finish: (result: VictoryResult | null) => void
  readonly clearResult: () => void
}

export type GameStore = StoreApi<GameStoreState>

type GameStoreDeps = {
  readonly services: AppServices
  readonly bus: EventBus<GameEvent>
  readonly getSettings: () => Settings
  readonly getFreeHints: () => number
}

type PuzzleParams = Omit<NewGameParams, 'gameId' | 'now'>

export const createGameStore = ({
  services,
  bus,
  getSettings,
  getFreeHints,
}: GameStoreDeps): GameStore =>
  createStore<GameStoreState>()((set, get) => {
    const restore = (game: GameState): GameState =>
      withFreeHints(fromPersistedGame(game), getFreeHints())

    const dispatch = (action: GameAction): void => {
      const game = get().game
      if (!game) return
      const result = gameReducer(game, action, {
        now: services.clock.now(),
        settings: gameSettingsOf(getSettings()),
      })
      if (result.state !== game) set({ game: result.state })
      bus.emit(result.events)
    }

    const leaveCurrent = async (): Promise<void> => {
      const current = get().game
      if (!isActiveGame(current)) return
      if (current.mode === 'quick') {
        dispatch({ type: 'abandon' })
        return
      }
      dispatch({ type: 'pause' })
      const paused = get().game
      if (paused) await services.persistence.saveGame(toPersistedGame(paused, services.clock.now()))
    }

    const startGame = (params: PuzzleParams): void => {
      const result = createGame({
        ...params,
        gameId: services.createId(),
        now: services.clock.now(),
        hintsPerGame: getFreeHints(),
      })
      set({ game: result.state, isStarting: false })
      bus.emit(result.events)
    }

    return {
      game: null,
      lastResult: null,
      isStarting: false,
      hydrate: (game) => set({ game: game && restore(game) }),
      openCollectionPuzzle: async (puzzleId) => {
        if (get().game?.puzzleId === puzzleId && isActiveGame(get().game)) return true
        const puzzle = findCollectionPuzzle(puzzleId)
        if (!puzzle) return false
        set({ isStarting: true, lastResult: null })
        await leaveCurrent()
        const saved = await services.persistence.loadGame(puzzleId)
        if (saved && isActiveGame(saved)) {
          set({ game: restore(saved), isStarting: false })
          return true
        }
        startGame({
          puzzleId,
          mode: 'collection',
          name: puzzle.name,
          sizeId: puzzle.sizeId,
          difficulty: puzzle.difficulty,
          solution: decodeSolution(puzzle.solution),
        })
        return true
      },
      startQuickGame: async (sizeId, difficulty) => {
        set({ isStarting: true, lastResult: null })
        await leaveCurrent()
        const puzzle = await services.puzzles.take(sizeId, difficulty)
        startGame({
          puzzleId: puzzle.id,
          mode: 'quick',
          name: null,
          sizeId,
          difficulty,
          solution: decodeSolution(puzzle.solution),
        })
      },
      dispatch,
      requestHint: () => {
        const game = get().game
        if (game) set({ game: withFreeHints(game, getFreeHints()) })
        dispatch({ type: 'hint' })
      },
      finish: (lastResult) => set({ game: null, lastResult }),
      clearResult: () => set({ lastResult: null }),
    }
  })
