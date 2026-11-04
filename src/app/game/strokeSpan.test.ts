import { describe, expect, it } from 'vitest'
import { dominantAxis, strokeSpan } from './strokeSpan'

const SIZE = { rows: 5, cols: 5 }

describe('strokeSpan', () => {
  it('returns the cells from the origin to the target along a row', () => {
    expect(strokeSpan(SIZE, 6, 9, null)).toEqual([7, 8, 9])
    expect(strokeSpan(SIZE, 9, 6, null)).toEqual([8, 7, 6])
  })

  it('projects diagonal targets onto the dominant or locked axis', () => {
    expect(dominantAxis(SIZE, 0, 17)).toBe('col')
    expect(strokeSpan(SIZE, 0, 17, null)).toEqual([5, 10, 15])
    expect(strokeSpan(SIZE, 0, 17, 'row')).toEqual([1, 2])
  })

  it('is empty on the origin', () => {
    expect(strokeSpan(SIZE, 12, 12, 'col')).toEqual([])
  })
})
