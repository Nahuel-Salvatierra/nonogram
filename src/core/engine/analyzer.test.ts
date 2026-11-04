import { describe, expect, it } from 'vitest'
import {
  DIAGONAL_2X2,
  NEEDS_LINE_SOLVER,
  NEEDS_PROBING_10,
  PLAN_EXAMPLE,
} from './__fixtures__/puzzles'
import { firstPassRatio, ratePuzzle } from './analyzer'
import { classify } from './profiles'

describe('ratePuzzle', () => {
  it('rates the plan example as an easy tier 1 puzzle', () => {
    const rating = ratePuzzle(PLAN_EXAMPLE.size, PLAN_EXAMPLE.clues)
    expect(rating).toMatchObject({ isSolvable: true, maxTier: 1, probes: 0, difficulty: 'easy' })
    expect(rating.density).toBeCloseTo(13 / 25)
    expect(rating.unresolved).toEqual([])
  })

  it('requires the line solver for tier 2 puzzles', () => {
    const rating = ratePuzzle(NEEDS_LINE_SOLVER.size, NEEDS_LINE_SOLVER.clues)
    expect(rating.isSolvable).toBe(true)
    expect(rating.maxTier).toBeGreaterThanOrEqual(2)
    expect(rating.maxTier).toBeLessThan(4)
  })

  it('rates puzzles that need probing as expert', () => {
    const rating = ratePuzzle(NEEDS_PROBING_10.size, NEEDS_PROBING_10.clues)
    expect(rating).toMatchObject({ isSolvable: true, maxTier: 4, difficulty: 'expert' })
    expect(rating.probes).toBeGreaterThan(0)
  })

  it('stops at the allowed tier and reports unresolved cells', () => {
    const rating = ratePuzzle(NEEDS_PROBING_10.size, NEEDS_PROBING_10.clues, 2)
    expect(rating.isSolvable).toBe(false)
    expect(rating.difficulty).toBeNull()
    expect(rating.unresolved.length).toBeGreaterThan(0)
  })

  it('marks ambiguous puzzles as unsolvable', () => {
    const rating = ratePuzzle(DIAGONAL_2X2.size, DIAGONAL_2X2.clues)
    expect(rating.isSolvable).toBe(false)
    expect(rating.unresolved).toEqual([0, 1, 2, 3])
  })

  it('scores harder puzzles higher', () => {
    const easy = ratePuzzle(PLAN_EXAMPLE.size, PLAN_EXAMPLE.clues)
    const expert = ratePuzzle(NEEDS_PROBING_10.size, NEEDS_PROBING_10.clues)
    expect(expert.score).toBeGreaterThan(easy.score)
  })
})

describe('firstPassRatio', () => {
  it('counts cells resolved by simple logic on the empty board', () => {
    expect(firstPassRatio(PLAN_EXAMPLE.size, PLAN_EXAMPLE.clues)).toBeGreaterThan(0.25)
  })
})

describe('classify', () => {
  it('maps tiers to difficulties', () => {
    expect(classify({ maxTier: 1, firstPassRatio: 0.5 })).toBe('easy')
    expect(classify({ maxTier: 1, firstPassRatio: 0.1 })).toBe('medium')
    expect(classify({ maxTier: 2, firstPassRatio: 0.5 })).toBe('medium')
    expect(classify({ maxTier: 3, firstPassRatio: 0.05 })).toBe('hard')
    expect(classify({ maxTier: 4, firstPassRatio: 0.3 })).toBe('expert')
  })
})
