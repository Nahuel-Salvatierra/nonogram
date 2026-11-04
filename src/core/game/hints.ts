import { allLines, lineCells, type CellState, type LineRef } from '../engine/grid'
import { deduceLine, type LineTier } from '../engine/propagate'
import { findErrors } from '../engine/validator'
import { sizeOf } from './board'
import { afterBoardChange } from './completion'
import type { GameResult } from './events'
import { unchanged, withEvents } from './result'
import type { GameContext, GameState, HintInfo } from './types'

type LineHint = {
  readonly line: LineRef
  readonly tier: LineTier
  readonly cells: readonly number[]
  readonly states: readonly CellState[]
}

export const findLineHint = (state: GameState): LineHint | null => {
  const size = sizeOf(state)
  for (const tier of [1, 2] as const) {
    let best: LineHint | null = null
    for (const line of allLines(size)) {
      const result = deduceLine(size, state.clues, state.cells, line, tier)
      if (result && result.cells.length > (best?.cells.length ?? 0))
        best = { line, tier, ...result }
    }
    if (best) return best
  }
  return null
}

const knownRatio = (state: GameState, line: LineRef): number => {
  const indices = lineCells(sizeOf(state), line)
  const unknown = indices.filter((cell) => state.cells[cell] === 'unknown').length
  return unknown === 0 ? -1 : 1 - unknown / indices.length
}

export const findRevealCell = (state: GameState): number | null => {
  const lines = allLines(sizeOf(state))
  const best = lines.reduce<LineRef | null>(
    (current, line) =>
      current === null || knownRatio(state, line) > knownRatio(state, current) ? line : current,
    null,
  )
  if (best === null) return null
  return lineCells(sizeOf(state), best).find((cell) => state.cells[cell] === 'unknown') ?? null
}

type HintRequest = {
  readonly context: GameContext
  readonly isRewarded: boolean
}

const applyHint = (
  state: GameState,
  cells: readonly number[],
  states: readonly CellState[],
  hint: HintInfo,
  { context, isRewarded }: HintRequest,
): GameResult => {
  const nextCells = [...state.cells]
  cells.forEach((cell, i) => {
    nextCells[cell] = states[i]
  })
  const next: GameState = {
    ...state,
    cells: nextCells,
    hintedCells: [...state.hintedCells, ...cells],
    hintsUsed: state.hintsUsed + 1,
    hintsRemaining: isRewarded ? state.hintsRemaining : state.hintsRemaining - 1,
    lastHint: hint,
  }
  return afterBoardChange(next, context, [
    {
      type: 'hintUsed',
      gameId: state.gameId,
      kind: hint.kind,
      hintsRemaining: next.hintsRemaining,
      isRewarded,
    },
  ])
}

export const requestHint = (
  state: GameState,
  context: GameContext,
  isRewarded = false,
): GameResult => {
  if (state.status !== 'playing' || state.activeStroke !== null) return unchanged(state)
  const errors = findErrors(state.cells, state.solution)
  if (errors.length > 0) return unchanged({ ...state, lastHint: { kind: 'errors', cells: errors } })
  if (!isRewarded && state.hintsRemaining <= 0) {
    return withEvents(
      { ...state, lastHint: { kind: 'exhausted' } },
      { type: 'hintsExhausted', gameId: state.gameId },
    )
  }
  const request: HintRequest = { context, isRewarded }
  const lineHint = findLineHint(state)
  if (lineHint) {
    const { line, tier, cells, states } = lineHint
    return applyHint(state, cells, states, { kind: 'line', line, tier, cells }, request)
  }
  const cell = findRevealCell(state)
  if (cell === null) return unchanged(state)
  const revealed: CellState = state.solution[cell] ? 'filled' : 'crossed'
  return applyHint(state, [cell], [revealed], { kind: 'reveal', cell }, request)
}

export const withFreeHints = (state: GameState, count: number): GameState =>
  state.hintsRemaining === count ? state : { ...state, hintsRemaining: count }

export const dismissHint = (state: GameState): GameResult =>
  state.lastHint === null ? unchanged(state) : unchanged({ ...state, lastHint: null })
