import type { GameState } from '@core/game/types'
import { syncTimer } from '@core/game/timer'

export const toPersistedGame = (game: GameState, now: number): GameState => syncTimer(game, now)

export const fromPersistedGame = (game: GameState): GameState =>
  game.status === 'playing'
    ? { ...game, status: 'paused', runningSince: null, lastHint: null }
    : { ...game, runningSince: null }

export const isActiveGame = (game: GameState | null): game is GameState =>
  game !== null && (game.status === 'playing' || game.status === 'paused' || game.status === 'lost')
