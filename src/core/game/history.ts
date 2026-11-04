import { isLocked } from './board'
import { afterBoardChange } from './completion'
import type { GameResult } from './events'
import { unchanged } from './result'
import type { GameContext, GameState, Move } from './types'

export const HISTORY_LIMIT = 300

const writeCell = (state: GameState, cell: number, value: Move['after']): GameState => {
  const cells = [...state.cells]
  cells[cell] = value
  return { ...state, cells, lastHint: null }
}

const applyForward = (state: GameState, move: Move): GameState =>
  writeCell(state, move.cell, move.after)

const applyBackward = (state: GameState, move: Move): GameState =>
  writeCell(state, move.cell, move.before)

export const recordMove = (state: GameState, move: Move): GameState => ({
  ...applyForward(state, move),
  history: [...state.history, move].slice(-HISTORY_LIMIT),
  redoStack: [],
})

export const nextBatchId = (state: GameState): number =>
  Math.max(state.history.at(-1)?.batch ?? 0, state.redoStack.at(-1)?.batch ?? 0) + 1

const popGroup = (state: GameState, stack: readonly Move[]): { moves: Move[]; rest: Move[] } => {
  const rest = [...stack]
  const moves: Move[] = []
  const batch = rest.at(-1)?.batch
  while (rest.length > 0 && rest[rest.length - 1].batch === batch) {
    const move = rest[rest.length - 1]
    rest.pop()
    if (!isLocked(state, move.cell)) moves.push(move)
  }
  return { moves, rest }
}

const canEdit = (state: GameState): boolean =>
  state.status === 'playing' && state.activeStroke === null

export const undo = (state: GameState): GameResult => {
  if (!canEdit(state)) return unchanged(state)
  const { moves, rest } = popGroup(state, state.history)
  if (moves.length === 0) return unchanged({ ...state, history: rest })
  return unchanged({
    ...moves.reduce(applyBackward, state),
    history: rest,
    redoStack: [...state.redoStack, ...moves],
  })
}

export const redo = (state: GameState, context: GameContext): GameResult => {
  if (!canEdit(state)) return unchanged(state)
  const { moves, rest } = popGroup(state, state.redoStack)
  if (moves.length === 0) return unchanged({ ...state, redoStack: rest })
  const next: GameState = {
    ...moves.reduce(applyForward, state),
    history: [...state.history, ...moves].slice(-HISTORY_LIMIT),
    redoStack: rest,
  }
  return afterBoardChange(next, context, [])
}
