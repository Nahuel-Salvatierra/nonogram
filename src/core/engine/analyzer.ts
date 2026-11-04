import { clueSum, type Clues } from './clues'
import type { Difficulty } from './difficulty'
import { allLines, cellCount, emptyCells, lineCells, type CellState, type Size } from './grid'
import { solveLineSimple } from './lineSimple'
import { solveWithProbing } from './probe'
import { clueOf, propagate, type PropagationResult } from './propagate'
import { classify, isDeepPropagation, type SolverTier, type Tier } from './profiles'

export type Rating = {
  readonly isSolvable: boolean
  readonly maxTier: Tier
  readonly rounds: number
  readonly steps: number
  readonly probes: number
  readonly firstPassRatio: number
  readonly density: number
  readonly averageClueCount: number
  readonly score: number
  readonly difficulty: Difficulty | null
  readonly unresolved: readonly number[]
}

export const firstPassRatio = (size: Size, clues: Clues): number => {
  const resolved = new Set<number>()
  for (const line of allLines(size)) {
    const indices = lineCells(size, line)
    const result = solveLineSimple(
      indices.map((): CellState => 'unknown'),
      clueOf(clues, line),
    )
    result?.forEach((cell, i) => {
      if (cell !== 'unknown') resolved.add(indices[i])
    })
  }
  return resolved.size / cellCount(size)
}

const densityOf = (size: Size, clues: Clues): number =>
  clues.rows.reduce((sum, clue) => sum + clueSum(clue), 0) / cellCount(size)

const averageClueCount = (clues: Clues): number => {
  const all = [...clues.rows, ...clues.cols]
  return all.reduce((sum, clue) => sum + Math.max(clue.length, 1), 0) / all.length
}

const unresolvedCells = (cells: readonly CellState[]): number[] =>
  cells.flatMap((cell, i) => (cell === 'unknown' ? [i] : []))

const scoreOf = (tier: Tier, rounds: number, probes: number, firstPass: number): number =>
  Math.round(tier * 100 + rounds * 3 + probes * 15 + (1 - firstPass) * 30)

type Outcome = {
  readonly solved: boolean
  readonly tier: Tier
  readonly rounds: number
  readonly steps: number
  readonly probes: number
  readonly cells: readonly CellState[]
}

const fromPropagation = (result: PropagationResult, tier: Tier): Outcome => ({
  solved: result.status === 'solved',
  tier,
  rounds: result.rounds,
  steps: result.steps.length,
  probes: 0,
  cells: result.cells,
})

const solve = (size: Size, clues: Clues, maxTier: SolverTier, firstPass: number): Outcome => {
  const empty = emptyCells(size)
  const simple = fromPropagation(propagate(size, clues, empty, 1), 1)
  if (simple.solved || maxTier === 1) return simple
  const full = propagate(size, clues, empty, 2)
  const lineTier: Tier = isDeepPropagation(full.rounds, firstPass) ? 3 : 2
  const line = fromPropagation(full, lineTier)
  if (line.solved || maxTier === 2) return line
  const probed = solveWithProbing(size, clues, empty)
  return {
    solved: probed.status === 'solved',
    tier: 4,
    rounds: probed.rounds,
    steps: line.steps,
    probes: probed.probes,
    cells: probed.cells,
  }
}

export const ratePuzzle = (size: Size, clues: Clues, maxTier: SolverTier = 4): Rating => {
  const firstPass = firstPassRatio(size, clues)
  const outcome = solve(size, clues, maxTier, firstPass)
  return {
    isSolvable: outcome.solved,
    maxTier: outcome.tier,
    rounds: outcome.rounds,
    steps: outcome.steps,
    probes: outcome.probes,
    firstPassRatio: firstPass,
    density: densityOf(size, clues),
    averageClueCount: averageClueCount(clues),
    score: scoreOf(outcome.tier, outcome.rounds, outcome.probes, firstPass),
    difficulty: outcome.solved
      ? classify({ maxTier: outcome.tier, firstPassRatio: firstPass })
      : null,
    unresolved: unresolvedCells(outcome.cells),
  }
}
