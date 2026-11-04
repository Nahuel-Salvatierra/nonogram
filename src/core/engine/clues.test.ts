import { describe, expect, it } from 'vitest'
import { PLAN_EXAMPLE } from './__fixtures__/puzzles'
import { clueSum, deriveClues, lineClue, lineMatchesClue, minLength } from './clues'
import { parseLine } from './text'

describe('lineClue', () => {
  it('returns block lengths in order', () => {
    expect(lineClue([true, true, false, true, false, false, true, true, true])).toEqual([2, 1, 3])
  })

  it('returns an empty clue for an empty line', () => {
    expect(lineClue([false, false, false])).toEqual([])
  })
})

describe('deriveClues', () => {
  it('derives the clues of the plan example', () => {
    expect(PLAN_EXAMPLE.clues.rows).toEqual([[3], [1, 1], [5], [1], [2]])
    expect(PLAN_EXAMPLE.clues.cols).toEqual([[1], [3], [1, 3], [3, 1], [1]])
    expect(deriveClues(PLAN_EXAMPLE.size, PLAN_EXAMPLE.solution)).toEqual(PLAN_EXAMPLE.clues)
  })
})

describe('lineMatchesClue', () => {
  it('ignores crosses and compares filled blocks', () => {
    expect(lineMatchesClue(parseLine('##x.#'), [2, 1])).toBe(true)
    expect(lineMatchesClue(parseLine('###.#'), [2, 1])).toBe(false)
    expect(lineMatchesClue(parseLine('x.x..'), [])).toBe(true)
  })
})

describe('clue sizes', () => {
  it('computes the sum and the minimum length', () => {
    expect(clueSum([1, 3])).toBe(4)
    expect(minLength([1, 3])).toBe(5)
    expect(minLength([])).toBe(0)
  })
})
