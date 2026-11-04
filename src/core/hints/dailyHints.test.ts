import { describe, expect, it } from 'vitest'
import {
  consumeFreeHint,
  FREE_HINTS_PER_DAY,
  freeHintsLeft,
  localDayOf,
  NO_DAILY_HINTS,
} from './dailyHints'

const DAY = '2026-10-03'

describe('daily hints', () => {
  it('formats the local calendar day', () => {
    expect(localDayOf(new Date(2026, 9, 3, 0, 0).getTime())).toBe(DAY)
    expect(localDayOf(new Date(2026, 9, 3, 23, 59).getTime())).toBe(DAY)
    expect(localDayOf(new Date(2026, 9, 4, 0, 0).getTime())).toBe('2026-10-04')
  })

  it('starts with the full daily budget', () => {
    expect(freeHintsLeft(NO_DAILY_HINTS, DAY)).toBe(FREE_HINTS_PER_DAY)
  })

  it('gives three free hints and no fourth one on the same day', () => {
    const spent = [1, 2, 3].reduce((hints) => consumeFreeHint(hints, DAY), NO_DAILY_HINTS)
    expect(spent).toEqual({ day: DAY, used: 3 })
    expect(freeHintsLeft(spent, DAY)).toBe(0)
    expect(freeHintsLeft(consumeFreeHint(spent, DAY), DAY)).toBe(0)
  })

  it('resets the budget on a new day', () => {
    const spent = { day: DAY, used: 3 }
    expect(freeHintsLeft(spent, '2026-10-04')).toBe(FREE_HINTS_PER_DAY)
    expect(consumeFreeHint(spent, '2026-10-04')).toEqual({ day: '2026-10-04', used: 1 })
  })
})
