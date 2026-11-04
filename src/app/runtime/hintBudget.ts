import { consumeFreeHint, freeHintsLeft, localDayOf, type DailyHints } from '@core/hints/dailyHints'
import type { AppServices } from '@services/AppServices'
import type { Meta } from '@services/storage/schemas'

export type HintBudget = {
  readonly hydrate: (meta: Meta) => void
  readonly freeHints: () => number
  readonly consume: () => Promise<void>
}

const dailyHintsOf = (meta: Meta | null): DailyHints => ({
  day: meta?.hintDay ?? null,
  used: meta?.freeHintsUsed ?? 0,
})

export const createHintBudget = ({ clock, persistence }: AppServices): HintBudget => {
  let meta: Meta | null = null
  const today = (): string => localDayOf(clock.now())

  return {
    hydrate: (value) => {
      meta = value
    },
    freeHints: () => freeHintsLeft(dailyHintsOf(meta), today()),
    consume: async () => {
      if (!meta) return
      const next = consumeFreeHint(dailyHintsOf(meta), today())
      meta = { ...meta, hintDay: next.day, freeHintsUsed: next.used }
      await persistence.saveMeta(meta)
    },
  }
}
