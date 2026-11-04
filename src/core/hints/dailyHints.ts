export const FREE_HINTS_PER_DAY = 3

export type DailyHints = {
  readonly day: string | null
  readonly used: number
}

export const NO_DAILY_HINTS: DailyHints = { day: null, used: 0 }

const pad = (value: number): string => String(value).padStart(2, '0')

export const localDayOf = (timestamp: number): string => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const usedOn = (hints: DailyHints, day: string): number => (hints.day === day ? hints.used : 0)

export const freeHintsLeft = (hints: DailyHints, day: string): number =>
  Math.max(0, FREE_HINTS_PER_DAY - usedOn(hints, day))

export const consumeFreeHint = (hints: DailyHints, day: string): DailyHints => ({
  day,
  used: usedOn(hints, day) + 1,
})
