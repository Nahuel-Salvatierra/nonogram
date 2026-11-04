import { describe, expect, it } from 'vitest'
import { DIAGONAL_2X2, NEEDS_PROBING, PLAN_EXAMPLE } from './__fixtures__/puzzles'
import { countSolutions } from './search'

describe('countSolutions', () => {
  it('finds exactly one solution for unique puzzles', () => {
    expect(countSolutions(PLAN_EXAMPLE.size, PLAN_EXAMPLE.clues)).toBe(1)
    expect(countSolutions(NEEDS_PROBING.size, NEEDS_PROBING.clues)).toBe(1)
  })

  it('stops at the limit for ambiguous puzzles', () => {
    expect(countSolutions(DIAGONAL_2X2.size, DIAGONAL_2X2.clues)).toBe(2)
    expect(countSolutions(DIAGONAL_2X2.size, DIAGONAL_2X2.clues, 1)).toBe(1)
  })

  it('returns zero for impossible clues', () => {
    const size = { rows: 2, cols: 2 }
    expect(countSolutions(size, { rows: [[2], []], cols: [[], []] })).toBe(0)
  })
})
