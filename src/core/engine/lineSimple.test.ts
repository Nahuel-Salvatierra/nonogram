import { describe, expect, it } from 'vitest'
import type { Clue } from './clues'
import { solveLineSimple } from './lineSimple'
import { solveLine } from './lineSolver'
import { formatLine, parseLine } from './text'

const simple = (line: string, clue: Clue): string | null => {
  const result = solveLineSimple(parseLine(line), clue)
  return result && formatLine(result)
}

describe('solveLineSimple', () => {
  it('fills the overlap of the extreme placements', () => {
    expect(simple('..........', [7])).toBe('...####...')
    expect(simple('.....', [3])).toBe('..#..')
  })

  it('fixes exact-sum lines and empty lines', () => {
    expect(simple('.....', [1, 3])).toBe('#x###')
    expect(simple('...', [])).toBe('xxx')
  })

  it('uses crosses to narrow the extreme placements', () => {
    expect(simple('x.....', [4])).toBe('x.###.')
    expect(simple('..x.....', [3])).toBe('xxx..#..')
  })

  it('crosses the rest of a line whose blocks are all filled', () => {
    expect(simple('##.#.', [2, 1])).toBe('##x#x')
  })

  it('does not use filled cells to push blocks', () => {
    expect(simple('#.....', [3])).toBe('#.....')
    expect(formatLine(solveLine(parseLine('#.....'), [3]) ?? [])).toBe('###xxx')
  })

  it('detects contradictions', () => {
    expect(simple('##x##', [1])).toBeNull()
    expect(simple('#x#x#', [2, 1])).toBeNull()
    expect(simple('xxx..', [3])).toBeNull()
  })
})
