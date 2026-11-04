import type { Clue } from '@core/engine/clues'
import {
  colOf,
  lineCells,
  rowOf,
  type Axis,
  type CellState,
  type LineRef,
  type Size,
} from '@core/engine/grid'
import { completedLines } from '@core/engine/validator'
import { sizeOf } from '@core/game/board'
import type { GameState, HintInfo } from '@core/game/types'
import type { Settings } from '@core/settings'

export const GUIDE_EVERY = 5

export type CellView = {
  readonly cell: number
  readonly row: number
  readonly col: number
  readonly state: CellState
  readonly isError: boolean
  readonly isHinted: boolean
  readonly isHighlighted: boolean
  readonly isHintTarget: boolean
  readonly hasGuideRight: boolean
  readonly hasGuideBottom: boolean
}

export type ClueView = {
  readonly axis: Axis
  readonly index: number
  readonly numbers: Clue
  readonly isDone: boolean
  readonly isActive: boolean
  readonly isHintLine: boolean
}

export type ClueViews = {
  readonly rows: readonly ClueView[]
  readonly cols: readonly ClueView[]
}

const hasGuideAfter = (index: number, count: number): boolean =>
  (index + 1) % GUIDE_EVERY === 0 && index < count - 1

const hintLine = (hint: HintInfo | null): LineRef | null =>
  hint?.kind === 'line' ? hint.line : null

const hintTargets = (hint: HintInfo | null): ReadonlySet<number> => {
  if (!hint) return new Set()
  if (hint.kind === 'errors' || hint.kind === 'line') return new Set(hint.cells)
  if (hint.kind === 'reveal') return new Set([hint.cell])
  return new Set()
}

const highlightedLines = (game: GameState, settings: Settings, size: Size): readonly LineRef[] => {
  const lines: LineRef[] = []
  const line = hintLine(game.lastHint)
  if (line) lines.push(line)
  if (settings.highlightLines && game.focusedCell !== null) {
    lines.push({ axis: 'row', index: rowOf(size, game.focusedCell) })
    lines.push({ axis: 'col', index: colOf(size, game.focusedCell) })
  }
  return lines
}

export const buildCellViews = (game: GameState, settings: Settings): CellView[] => {
  const size = sizeOf(game)
  const highlighted = new Set(
    highlightedLines(game, settings, size).flatMap((line) => lineCells(size, line)),
  )
  const targets = hintTargets(game.lastHint)
  const errors = new Set(game.errorCells)
  const hinted = new Set(game.hintedCells)
  return game.cells.map((state, cell) => {
    const row = rowOf(size, cell)
    const col = colOf(size, cell)
    return {
      cell,
      row,
      col,
      state,
      isError: errors.has(cell),
      isHinted: hinted.has(cell),
      isHighlighted: highlighted.has(cell),
      isHintTarget: targets.has(cell),
      hasGuideRight: hasGuideAfter(col, size.cols),
      hasGuideBottom: hasGuideAfter(row, size.rows),
    }
  })
}

const isSameLine = (a: LineRef | null, axis: Axis, index: number): boolean =>
  a !== null && a.axis === axis && a.index === index

export const buildClueViews = (game: GameState, settings: Settings): ClueViews => {
  const size = sizeOf(game)
  const done = completedLines(size, game.clues, game.cells)
  const focused = settings.highlightLines ? game.focusedCell : null
  const activeRow = focused === null ? null : rowOf(size, focused)
  const activeCol = focused === null ? null : colOf(size, focused)
  const hinted = hintLine(game.lastHint)
  const build =
    (axis: Axis, completed: readonly boolean[], active: number | null) =>
    (numbers: Clue, index: number): ClueView => ({
      axis,
      index,
      numbers,
      isDone: settings.dimCompletedClues && completed[index],
      isActive: active === index,
      isHintLine: isSameLine(hinted, axis, index),
    })
  return {
    rows: game.clues.rows.map(build('row', done.rows, activeRow)),
    cols: game.clues.cols.map(build('col', done.cols, activeCol)),
  }
}

export const longestClue = (clues: readonly Clue[]): number =>
  Math.max(1, ...clues.map((clue) => clue.length))

export const strokeCount = (game: GameState): number | null =>
  game.activeStroke && game.activeStroke.visited.length > 1
    ? game.activeStroke.visited.length
    : null
