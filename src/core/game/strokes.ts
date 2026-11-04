import { cellCount, colOf, rowOf, type Axis, type CellState } from '../engine/grid'
import { isLocked, sizeOf } from './board'
import { autoCrossLines, linesThrough, paintCell } from './cells'
import { afterBoardChange, reachedMistakeLimit } from './completion'
import type { GameEvent, GameResult } from './events'
import { nextBatchId } from './history'
import { unchanged } from './result'
import type { GameContext, GameState, Stroke, Tool } from './types'

const TOOL_STATE: Readonly<Record<Tool, CellState>> = { fill: 'filled', cross: 'crossed' }

export const setTool = (state: GameState, tool: Tool): GameResult =>
  state.tool === tool || state.activeStroke !== null
    ? unchanged(state)
    : unchanged({ ...state, tool })

const strokeModeFor = (state: GameState, cell: number): Pick<Stroke, 'from' | 'to'> => {
  const target = TOOL_STATE[state.tool]
  const current = state.cells[cell]
  return current === target && !isLocked(state, cell)
    ? { from: target, to: 'unknown' }
    : { from: 'unknown', to: target }
}

const paintStrokeCells = (
  state: GameState,
  stroke: Stroke,
  cells: readonly number[],
  context: GameContext,
): { state: GameState; events: GameEvent[] } =>
  cells.reduce<{ state: GameState; events: GameEvent[] }>(
    (acc, cell) => {
      if (acc.state.cells[cell] !== stroke.from || reachedMistakeLimit(acc.state, acc.events)) {
        return acc
      }
      const update = paintCell(acc.state, cell, stroke.to, stroke.batch, context.settings)
      return { state: update.state, events: [...acc.events, ...update.events] }
    },
    { state, events: [] },
  )

const isValidCell = (state: GameState, cell: number): boolean =>
  Number.isInteger(cell) && cell >= 0 && cell < cellCount(sizeOf(state))

export const beginStroke = (state: GameState, cell: number, context: GameContext): GameResult => {
  if (state.status !== 'playing' || !isValidCell(state, cell)) return unchanged(state)
  const stroke: Stroke = {
    origin: cell,
    ...strokeModeFor(state, cell),
    axis: null,
    batch: nextBatchId(state),
    visited: [cell],
  }
  const started: GameState = { ...state, activeStroke: stroke, focusedCell: cell, lastHint: null }
  const painted = paintStrokeCells(started, stroke, [cell], context)
  return afterBoardChange(painted.state, context, painted.events)
}

const axisOf = (state: GameState, origin: number, cell: number): Axis =>
  rowOf(sizeOf(state), cell) === rowOf(sizeOf(state), origin) ? 'row' : 'col'

const isOnAxis = (state: GameState, origin: number, axis: Axis, cell: number): boolean => {
  const size = sizeOf(state)
  return axis === 'row'
    ? rowOf(size, cell) === rowOf(size, origin)
    : colOf(size, cell) === colOf(size, origin)
}

export const extendStroke = (
  state: GameState,
  cells: readonly number[],
  context: GameContext,
): GameResult => {
  const stroke = state.activeStroke
  if (state.status !== 'playing' || stroke === null) return unchanged(state)
  const candidates = cells.filter((cell) => isValidCell(state, cell) && cell !== stroke.origin)
  if (candidates.length === 0) return unchanged(state)
  const axis = stroke.axis ?? axisOf(state, stroke.origin, candidates[0])
  const onAxis = candidates.filter((cell) => isOnAxis(state, stroke.origin, axis, cell))
  const fresh = onAxis.filter((cell) => !stroke.visited.includes(cell))
  const focusedCell = onAxis.at(-1) ?? state.focusedCell
  if (fresh.length === 0 && axis === stroke.axis && focusedCell === state.focusedCell) {
    return unchanged(state)
  }
  const nextStroke: Stroke = { ...stroke, axis, visited: [...stroke.visited, ...fresh] }
  const focused: GameState = { ...state, activeStroke: nextStroke, focusedCell }
  const painted = paintStrokeCells(focused, nextStroke, fresh, context)
  return afterBoardChange(painted.state, context, painted.events)
}

export const endStroke = (state: GameState, context: GameContext): GameResult => {
  const stroke = state.activeStroke
  if (stroke === null) return unchanged(state)
  const ended: GameState = { ...state, activeStroke: null }
  const crossed = context.settings.autoCross
    ? autoCrossLines(ended, linesThrough(ended, stroke.visited), stroke.batch, context.settings)
    : ended
  return afterBoardChange(crossed, context, [])
}
