import type { Clue, Clues } from './clues'
import {
  allLines,
  lineCells,
  linesOfCell,
  readLine,
  type CellState,
  type LineRef,
  type Size,
} from './grid'
import { solveLineSimple } from './lineSimple'
import { solveLine, type LineDeduction } from './lineSolver'

export type LineTier = 1 | 2

export type Step = {
  readonly line: LineRef
  readonly tier: LineTier
  readonly cells: readonly number[]
}

export type PropagationStatus = 'solved' | 'stuck' | 'contradiction'

export type PropagationResult = {
  readonly cells: CellState[]
  readonly status: PropagationStatus
  readonly steps: readonly Step[]
  readonly rounds: number
}

export const DEDUCTIONS: Readonly<Record<LineTier, LineDeduction>> = {
  1: solveLineSimple,
  2: solveLine,
}

export const clueOf = (clues: Clues, line: LineRef): Clue =>
  line.axis === 'row' ? clues.rows[line.index] : clues.cols[line.index]

const lineKey = (line: LineRef): string => `${line.axis}${line.index}`

export type LineDeductionResult = {
  readonly cells: readonly number[]
  readonly states: CellState[]
}

export const deduceLine = (
  size: Size,
  clues: Clues,
  cells: readonly CellState[],
  line: LineRef,
  tier: LineTier,
): LineDeductionResult | null => {
  const indices = lineCells(size, line)
  const before = readLine(cells, indices)
  const after = DEDUCTIONS[tier](before, clueOf(clues, line))
  if (after === null) return null
  const changed = indices.filter((_, i) => before[i] !== after[i])
  return { cells: changed, states: changed.map((cell) => after[indices.indexOf(cell)]) }
}

export const isComplete = (cells: readonly CellState[]): boolean =>
  cells.every((cell) => cell !== 'unknown')

export const propagate = (
  size: Size,
  clues: Clues,
  initial: readonly CellState[],
  maxTier: LineTier,
  dirtyLines: readonly LineRef[] = allLines(size),
): PropagationResult => {
  const cells = [...initial]
  const steps: Step[] = []
  let rounds = 0
  let dirty = new Map(dirtyLines.map((line) => [lineKey(line), line]))

  const apply = (line: LineRef, tier: LineTier): boolean | null => {
    const result = deduceLine(size, clues, cells, line, tier)
    if (result === null) return null
    if (result.cells.length === 0) return false
    result.cells.forEach((cell, i) => {
      cells[cell] = result.states[i]
      for (const crossing of linesOfCell(size, cell)) dirty.set(lineKey(crossing), crossing)
    })
    steps.push({ line, tier, cells: result.cells })
    return true
  }

  const done = (status: PropagationStatus): PropagationResult => ({ cells, status, steps, rounds })

  for (;;) {
    while (dirty.size > 0) {
      rounds++
      const current = [...dirty.values()]
      dirty = new Map()
      for (const line of current) if (apply(line, 1) === null) return done('contradiction')
    }
    if (isComplete(cells)) return done('solved')
    if (maxTier < 2) return done('stuck')
    rounds++
    let progressed = false
    for (const line of allLines(size)) {
      const changed = apply(line, 2)
      if (changed === null) return done('contradiction')
      progressed = progressed || changed
    }
    if (!progressed) return done('stuck')
  }
}
