import type { GameEvent, GameResult } from './events'
import type { GameState } from './types'

export const unchanged = (state: GameState): GameResult => ({ state, events: [] })

export const withEvents = (state: GameState, ...events: GameEvent[]): GameResult => ({
  state,
  events,
})
