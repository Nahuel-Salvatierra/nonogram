import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { lineClue, type Clue } from './clues'
import type { CellState, Line } from './grid'
import { solveLineSimple } from './lineSimple'
import { solveLine } from './lineSolver'
import { formatLine, parseLine } from './text'

const solve = (line: string, clue: Clue): string | null => {
  const result = solveLine(parseLine(line), clue)
  return result && formatLine(result)
}

const bruteForce = (line: Line, clue: Clue): CellState[] | null => {
  const n = line.length
  const options: boolean[][] = []
  for (let mask = 0; mask < 1 << n; mask++) {
    const filled = Array.from({ length: n }, (_, i) => (mask & (1 << i)) !== 0)
    const consistent = line.every(
      (cell, i) => cell === 'unknown' || (cell === 'filled') === filled[i],
    )
    const clueOf = lineClue(filled)
    if (consistent && clueOf.length === clue.length && clueOf.every((v, i) => v === clue[i])) {
      options.push(filled)
    }
  }
  if (options.length === 0) return null
  return line.map((cell, i) => {
    if (options.every((option) => option[i])) return 'filled'
    if (options.every((option) => !option[i])) return 'crossed'
    return cell
  })
}

const lineArbitrary = fc
  .tuple(
    fc.array(fc.boolean(), { minLength: 1, maxLength: 9 }),
    fc.array(fc.constantFrom<CellState>('unknown', 'unknown', 'filled', 'crossed'), {
      minLength: 9,
      maxLength: 9,
    }),
  )
  .map(([solution, knowledge]) => ({
    clue: lineClue(solution),
    line: solution.map((isFilled, i): CellState => {
      if (knowledge[i] === 'unknown') return 'unknown'
      return isFilled ? 'filled' : 'crossed'
    }),
  }))

describe('solveLine', () => {
  it('fills a full line', () => {
    expect(solve('.....', [5])).toBe('#####')
  })

  it('fills the overlap of a long block', () => {
    expect(solve('.....', [3])).toBe('..#..')
  })

  it('fixes a line whose clue sums to its length', () => {
    expect(solve('.....', [1, 3])).toBe('#x###')
  })

  it('crosses an empty clue line', () => {
    expect(solve('....', [])).toBe('xxxx')
  })

  it('uses known cells to push blocks', () => {
    expect(solve('x.....', [4])).toBe('x.###.')
    expect(solve('#.....', [3])).toBe('###xxx')
  })

  it('crosses cells around a completed block', () => {
    expect(solve('...##...', [2])).toBe('xxx##xxx')
  })

  it('detects contradictions', () => {
    expect(solve('#.#', [1])).toBeNull()
    expect(solve('x.x', [2])).toBeNull()
  })

  it('matches brute-force enumeration on short lines', () => {
    fc.assert(
      fc.property(lineArbitrary, ({ line, clue }) => {
        expect(solveLine(line, clue)).toEqual(bruteForce(line, clue))
      }),
      { numRuns: 400, seed: 42 },
    )
  })

  it('never contradicts a deduction of the simple solver', () => {
    fc.assert(
      fc.property(lineArbitrary, ({ line, clue }) => {
        const simple = solveLineSimple(line, clue)
        const full = solveLine(line, clue)
        expect(full).not.toBeNull()
        simple?.forEach((cell, i) => {
          if (cell !== 'unknown') expect(full?.[i]).toBe(cell)
        })
      }),
      { numRuns: 400, seed: 7 },
    )
  })
})
