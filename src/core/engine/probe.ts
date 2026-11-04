import type { Clues } from './clues'
import { linesOfCell, type CellState, type Size } from './grid'
import { propagate, type PropagationStatus } from './propagate'

export type ProbeResult = {
  readonly cells: CellState[]
  readonly status: PropagationStatus
  readonly probes: number
  readonly rounds: number
}

const OPPOSITE: Readonly<Record<'filled' | 'crossed', 'filled' | 'crossed'>> = {
  filled: 'crossed',
  crossed: 'filled',
}

const refutes = (
  size: Size,
  clues: Clues,
  cells: readonly CellState[],
  cell: number,
  guess: 'filled' | 'crossed',
): boolean => {
  const trial = [...cells]
  trial[cell] = guess
  return propagate(size, clues, trial, 2, linesOfCell(size, cell)).status === 'contradiction'
}

export const findProbe = (
  size: Size,
  clues: Clues,
  cells: readonly CellState[],
  startAt = 0,
): { readonly cell: number; readonly state: 'filled' | 'crossed' } | null => {
  for (let offset = 0; offset < cells.length; offset++) {
    const cell = (startAt + offset) % cells.length
    if (cells[cell] !== 'unknown') continue
    for (const guess of ['filled', 'crossed'] as const) {
      if (refutes(size, clues, cells, cell, guess)) return { cell, state: OPPOSITE[guess] }
    }
  }
  return null
}

export const solveWithProbing = (
  size: Size,
  clues: Clues,
  initial: readonly CellState[],
): ProbeResult => {
  let result = propagate(size, clues, initial, 2)
  let probes = 0
  let rounds = result.rounds
  let startAt = 0
  while (result.status === 'stuck') {
    const probe = findProbe(size, clues, result.cells, startAt)
    if (probe === null) break
    probes++
    startAt = probe.cell + 1
    const next = [...result.cells]
    next[probe.cell] = probe.state
    result = propagate(size, clues, next, 2, linesOfCell(size, probe.cell))
    rounds += result.rounds
  }
  return { cells: result.cells, status: result.status, probes, rounds }
}
