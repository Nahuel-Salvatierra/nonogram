import { describe, expect, it } from 'vitest'
import { NEEDS_LINE_SOLVER, NEEDS_PROBING, PLAN_EXAMPLE } from './__fixtures__/puzzles'
import { emptyCells } from './grid'
import { deduceLine, propagate } from './propagate'
import { solutionCells } from './validator'

describe('propagate', () => {
  it('solves the plan example with simple line logic', () => {
    const { size, clues, solution } = PLAN_EXAMPLE
    const result = propagate(size, clues, emptyCells(size), 1)
    expect(result.status).toBe('solved')
    expect(result.cells).toEqual(solutionCells(solution))
    expect(result.steps.every((step) => step.tier === 1)).toBe(true)
    expect(result.rounds).toBeGreaterThan(0)
  })

  it('gets stuck with tier 1 and solves with the full line solver', () => {
    const { size, clues, solution } = NEEDS_LINE_SOLVER
    expect(propagate(size, clues, emptyCells(size), 1).status).toBe('stuck')
    const result = propagate(size, clues, emptyCells(size), 2)
    expect(result.status).toBe('solved')
    expect(result.cells).toEqual(solutionCells(solution))
    expect(result.steps.some((step) => step.tier === 2)).toBe(true)
  })

  it('gets stuck on puzzles that need probing', () => {
    const { size, clues } = NEEDS_PROBING
    expect(propagate(size, clues, emptyCells(size), 2).status).toBe('stuck')
  })

  it('reports contradictions', () => {
    const { size, clues } = PLAN_EXAMPLE
    const cells = emptyCells(size)
    cells[0] = 'filled'
    expect(propagate(size, clues, cells, 2).status).toBe('contradiction')
  })
})

describe('deduceLine', () => {
  it('returns the changed cells of a line', () => {
    const { size, clues } = PLAN_EXAMPLE
    const result = deduceLine(size, clues, emptyCells(size), { axis: 'row', index: 2 }, 1)
    expect(result?.cells).toEqual([10, 11, 12, 13, 14])
    expect(result?.states).toEqual(['filled', 'filled', 'filled', 'filled', 'filled'])
  })
})
