import { describe, expect, it } from 'vitest'
import { PLAN_EXAMPLE } from './__fixtures__/puzzles'
import { emptyCells } from './grid'
import { completedLines, findErrors, isSolved, solutionCells } from './validator'

const { size, clues, solution } = PLAN_EXAMPLE

describe('validator', () => {
  it('finds wrong fills and wrong crosses', () => {
    const cells = emptyCells(size)
    cells[0] = 'filled'
    cells[1] = 'crossed'
    cells[2] = 'filled'
    cells[4] = 'crossed'
    expect(findErrors(cells, solution)).toEqual([0, 1])
  })

  it('reports lines whose filled cells match their clue', () => {
    const cells = emptyCells(size)
    for (let i = 10; i < 15; i++) cells[i] = 'filled'
    const lines = completedLines(size, clues, cells)
    expect(lines.rows).toEqual([false, false, true, false, false])
    expect(lines.cols).toEqual([true, false, false, false, true])
  })

  it('detects a solved board regardless of crosses', () => {
    const cells = solutionCells(solution).map((cell) => (cell === 'crossed' ? 'unknown' : cell))
    expect(isSolved(cells, solution)).toBe(true)
    expect(isSolved(emptyCells(size), solution)).toBe(false)
  })
})
