import { describe, expect, it } from 'vitest'
import { DIAGONAL_2X2, NEEDS_PROBING, NEEDS_PROBING_10 } from './__fixtures__/puzzles'
import { emptyCells } from './grid'
import { findProbe, solveWithProbing } from './probe'
import { solutionCells } from './validator'

describe('solveWithProbing', () => {
  it.each([
    ['6x6', NEEDS_PROBING],
    ['10x10', NEEDS_PROBING_10],
  ])('solves a %s puzzle that line logic alone cannot', (_, { size, clues, solution }) => {
    const result = solveWithProbing(size, clues, emptyCells(size))
    expect(result.status).toBe('solved')
    expect(result.probes).toBeGreaterThan(0)
    expect(result.cells).toEqual(solutionCells(solution))
  })

  it('stays stuck on ambiguous puzzles', () => {
    const { size, clues } = DIAGONAL_2X2
    expect(findProbe(size, clues, emptyCells(size))).toBeNull()
    expect(solveWithProbing(size, clues, emptyCells(size)).status).toBe('stuck')
  })

  it('returns probes consistent with the solution', () => {
    const { size, clues, solution } = NEEDS_PROBING
    const probe = findProbe(size, clues, emptyCells(size))
    expect(probe).not.toBeNull()
    if (probe) expect(probe.state === 'filled').toBe(solution[probe.cell])
  })
})
