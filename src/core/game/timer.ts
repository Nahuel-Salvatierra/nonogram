import type { GameState } from './types'

export const getElapsedMs = (state: GameState, now: number): number =>
  state.elapsedMs + (state.runningSince === null ? 0 : Math.max(0, now - state.runningSince))

export const stopTimer = (state: GameState, now: number): GameState => ({
  ...state,
  elapsedMs: getElapsedMs(state, now),
  runningSince: null,
})

export const startTimer = (state: GameState, now: number): GameState => ({
  ...state,
  runningSince: state.runningSince ?? now,
})

export const syncTimer = (state: GameState, now: number): GameState =>
  state.runningSince === null
    ? state
    : { ...state, elapsedMs: getElapsedMs(state, now), runningSince: now }
