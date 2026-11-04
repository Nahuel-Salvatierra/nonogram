import { lineMatchesClue } from '../engine/clues'
import { lineCells, linesOfCell, readLine, type CellState, type LineRef } from '../engine/grid'
import { clueOf } from '../engine/propagate'
import { isLocked, sizeOf } from './board'
import type { GameEvent } from './events'
import { recordMove } from './history'
import type { GameSettings, GameState } from './types'

export type CellUpdate = { readonly state: GameState; readonly events: readonly GameEvent[] }

const autoCorrect = (state: GameState, cell: number): CellUpdate => {
  const cells = [...state.cells]
  cells[cell] = 'crossed'
  const isNewMistake = !state.countedMistakes.includes(cell)
  return {
    state: {
      ...state,
      cells,
      errorCells: [...state.errorCells, cell],
      mistakes: state.mistakes + (isNewMistake ? 1 : 0),
      countedMistakes: isNewMistake ? [...state.countedMistakes, cell] : state.countedMistakes,
    },
    events: isNewMistake ? [{ type: 'mistakeMade', cell }] : [],
  }
}

export const paintCell = (
  state: GameState,
  cell: number,
  to: CellState,
  batch: number,
  settings: GameSettings,
): CellUpdate => {
  const before = state.cells[cell]
  if (before === to || isLocked(state, cell)) return { state, events: [] }
  if (to === 'filled' && settings.autoValidate && !state.solution[cell]) {
    return autoCorrect(state, cell)
  }
  return { state: recordMove(state, { cell, before, after: to, batch }), events: [] }
}

export const linesThrough = (state: GameState, cells: readonly number[]): LineRef[] => {
  const keys = new Set<string>()
  return cells
    .flatMap((cell) => linesOfCell(sizeOf(state), cell))
    .filter((line) => {
      const key = `${line.axis}${line.index}`
      if (keys.has(key)) return false
      keys.add(key)
      return true
    })
}

export const autoCrossLines = (
  state: GameState,
  lines: readonly LineRef[],
  batch: number,
  settings: GameSettings,
): GameState =>
  lines.reduce((current, line) => {
    const indices = lineCells(sizeOf(current), line)
    if (!lineMatchesClue(readLine(current.cells, indices), clueOf(current.clues, line))) {
      return current
    }
    return indices
      .filter((cell) => current.cells[cell] === 'unknown')
      .reduce((next, cell) => paintCell(next, cell, 'crossed', batch, settings).state, current)
  }, state)
