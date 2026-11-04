import { describe, expect, it } from 'vitest'
import { createRng, randomIntBetween, shuffle } from './rng'

describe('rng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    const seqA = Array.from({ length: 5 }, () => a.next())
    const seqB = Array.from({ length: 5 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('accepts string seeds deterministically', () => {
    expect(createRng('daily-v1-2026-10-02').next()).toBe(createRng('daily-v1-2026-10-02').next())
    expect(createRng('a').next()).not.toBe(createRng('b').next())
  })

  it('produces values in range', () => {
    const rng = createRng(7)
    for (let i = 0; i < 1000; i++) {
      const value = rng.next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
      const int = randomIntBetween(rng, 3, 5)
      expect(int).toBeGreaterThanOrEqual(3)
      expect(int).toBeLessThanOrEqual(5)
    }
  })

  it('shuffles without losing items or mutating input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const result = shuffle(createRng(1), input)
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect([...result].sort()).toEqual(input)
  })
})
