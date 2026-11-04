import { describe, expect, it } from 'vitest'
import { noisePattern, removeIsolated, smoothPattern } from './patterns'
import { createRng } from './rng'
import { formatPattern, parsePattern } from './text'

const size = { rows: 5, cols: 5 }

const grid = (rows: string[]): boolean[] => parsePattern(rows)?.solution.slice() ?? []

describe('patterns', () => {
  it('mirrors noise when a symmetry is requested', () => {
    const cells = noisePattern(createRng(3), size, 0.5, 'vertical')
    for (const row of formatPattern(size, cells)) expect(row).toBe([...row].reverse().join(''))
  })

  it('removes isolated pixels and fills enclosed holes', () => {
    const isolated = grid(['#....', '..#..', '.###.', '..#..', '.....'])
    expect(formatPattern(size, removeIsolated(size, isolated))[0]).toBe('.....')
    const hole = grid(['.....', '.###.', '.#.#.', '.###.', '.....'])
    expect(formatPattern(size, removeIsolated(size, hole))[2]).toBe('.###.')
  })

  it('smoothing turns noise into blobs', () => {
    const cells = grid(['#.#.#', '.###.', '#####', '.###.', '#.#.#'])
    const smooth = formatPattern(size, smoothPattern(size, cells, 1))
    expect(smooth[2]).toBe('#####')
  })
})
