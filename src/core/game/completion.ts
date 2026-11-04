import { isSolved } from '../engine/validator'
import { MAX_MISTAKES } from './createGame'
import type { GameEvent, GameResult, GameSummary } from './events'
import { stopTimer } from './timer'
import type { GameContext, GameState } from './types'

export const summaryOf = (state: GameState): GameSummary => ({
  gameId: state.gameId,
  puzzleId: state.puzzleId,
  mode: state.mode,
  sizeId: state.sizeId,
  difficulty: state.difficulty,
  elapsedMs: state.elapsedMs,
  mistakes: state.mistakes,
  hintsUsed: state.hintsUsed,
})

export const progressOf = (state: GameState): number => {
  const target = state.solution.filter(Boolean).length
  const correct = state.cells.filter((cell, i) => cell === 'filled' && state.solution[i]).length
  return target === 0 ? 1 : correct / target
}

export const reachedMistakeLimit = (state: GameState, events: readonly GameEvent[]): boolean =>
  state.mistakes >= MAX_MISTAKES && events.some((event) => event.type === 'mistakeMade')

export const afterBoardChange = (
  state: GameState,
  context: GameContext,
  events: readonly GameEvent[],
): GameResult => {
  if (state.status !== 'playing') return { state, events }
  if (reachedMistakeLimit(state, events)) {
    const lost: GameState = {
      ...stopTimer(state, context.now),
      status: 'lost',
      activeStroke: null,
      focusedCell: null,
      lastHint: null,
    }
    return { state: lost, events: [...events, { type: 'gameLost', summary: summaryOf(lost) }] }
  }
  if (!isSolved(state.cells, state.solution)) return { state, events }
  const completed: GameState = {
    ...stopTimer(state, context.now),
    status: 'completed',
    activeStroke: null,
    focusedCell: null,
    lastHint: null,
  }
  return {
    state: completed,
    events: [...events, { type: 'gameCompleted', summary: summaryOf(completed) }],
  }
}
