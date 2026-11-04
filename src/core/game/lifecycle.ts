import { emptyCells } from '../engine/grid'
import { sizeOf } from './board'
import { progressOf, summaryOf } from './completion'
import { MAX_MISTAKES } from './createGame'
import type { GameResult } from './events'
import { unchanged, withEvents } from './result'
import { startTimer, stopTimer, syncTimer } from './timer'
import type { GameContext, GameState } from './types'

const isActive = (state: GameState): boolean =>
  state.status === 'playing' || state.status === 'paused'

export const pause = (state: GameState, context: GameContext): GameResult =>
  state.status === 'playing'
    ? withEvents(
        {
          ...stopTimer(state, context.now),
          status: 'paused',
          activeStroke: null,
          focusedCell: null,
          lastHint: null,
        },
        { type: 'gamePaused' },
      )
    : unchanged(state)

export const resume = (state: GameState, context: GameContext): GameResult =>
  state.status === 'paused'
    ? withEvents({ ...startTimer(state, context.now), status: 'playing' }, { type: 'gameResumed' })
    : unchanged(state)

export const tick = (state: GameState, context: GameContext): GameResult =>
  state.status === 'playing' ? unchanged(syncTimer(state, context.now)) : unchanged(state)

export const restart = (state: GameState): GameResult => {
  if (!isActive(state)) return unchanged(state)
  const cells = emptyCells(sizeOf(state)).map((cell, i) =>
    state.hintedCells.includes(i) ? state.cells[i] : cell,
  )
  return withEvents(
    {
      ...state,
      cells,
      errorCells: [],
      history: [],
      redoStack: [],
      activeStroke: null,
      focusedCell: null,
      lastHint: null,
      restartCount: state.restartCount + 1,
    },
    { type: 'gameRestarted', gameId: state.gameId },
  )
}

export const retry = (state: GameState, context: GameContext): GameResult => {
  if (state.status !== 'lost') return unchanged(state)
  return withEvents(
    {
      ...state,
      cells: emptyCells(sizeOf(state)),
      errorCells: [],
      hintedCells: [],
      mistakes: 0,
      countedMistakes: [],
      hintsUsed: 0,
      elapsedMs: 0,
      runningSince: context.now,
      status: 'playing',
      history: [],
      redoStack: [],
      activeStroke: null,
      focusedCell: null,
      lastHint: null,
      restartCount: state.restartCount + 1,
    },
    { type: 'gameRestarted', gameId: state.gameId },
  )
}

export const continueAfterLoss = (state: GameState, context: GameContext): GameResult =>
  state.status === 'lost'
    ? withEvents(
        { ...startTimer(state, context.now), status: 'playing', mistakes: MAX_MISTAKES - 1 },
        { type: 'gameContinued', gameId: state.gameId },
      )
    : unchanged(state)

export const abandon = (state: GameState, context: GameContext): GameResult => {
  if (!isActive(state) && state.status !== 'lost') return unchanged(state)
  const abandoned: GameState = {
    ...stopTimer(state, context.now),
    status: 'abandoned',
    activeStroke: null,
  }
  return withEvents(abandoned, {
    type: 'gameAbandoned',
    summary: summaryOf(abandoned),
    progress: progressOf(abandoned),
  })
}
