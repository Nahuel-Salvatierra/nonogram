import { describe, expect, it } from 'vitest'
import {
  decodeCells,
  decodeSolution,
  encodeCells,
  encodeSolution,
  formatLine,
  formatPattern,
  parseLine,
  parsePattern,
} from './text'

describe('text formats', () => {
  it('round-trips lines', () => {
    expect(formatLine(parseLine('.#x#.'))).toBe('.#x#.')
  })

  it('round-trips persisted cells and rejects unknown codes', () => {
    const cells = parseLine('.#x')
    expect(encodeCells(cells)).toBe('ufx')
    expect(decodeCells('ufx')).toEqual(cells)
    expect(decodeCells('ufz')).toBeNull()
  })

  it('parses and formats patterns', () => {
    const pattern = parsePattern(['#.', '.#'])
    expect(pattern?.size).toEqual({ rows: 2, cols: 2 })
    expect(pattern && formatPattern(pattern.size, pattern.solution)).toEqual(['#.', '.#'])
  })

  it('rejects ragged or invalid patterns', () => {
    expect(parsePattern(['#.', '.'])).toBeNull()
    expect(parsePattern(['#x'])).toBeNull()
    expect(parsePattern([])).toBeNull()
  })

  it('round-trips solutions', () => {
    expect(decodeSolution(encodeSolution([true, false, true]))).toEqual([true, false, true])
  })
})
