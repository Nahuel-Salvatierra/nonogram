import { describe, expect, it } from 'vitest'
import { formatOptionalTime, formatTime } from './formatTime'

describe('formatTime', () => {
  it('formats minutes and seconds', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(61_999)).toBe('01:01')
  })

  it('adds hours when needed', () => {
    expect(formatTime(3_725_000)).toBe('1:02:05')
  })

  it('clamps negative values and renders a dash for null', () => {
    expect(formatTime(-500)).toBe('00:00')
    expect(formatOptionalTime(null)).toBe('—')
  })
})
