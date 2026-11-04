export type AnalyticsParams = Readonly<Record<string, string | number | boolean>>

export type AnalyticsEvent = {
  readonly name: string
  readonly params?: AnalyticsParams
}

export interface AnalyticsService {
  track(event: AnalyticsEvent): void
}

export const createNoopAnalytics = (): AnalyticsService => ({
  track: () => undefined,
})

export type RecordingAnalytics = AnalyticsService & { readonly events: readonly AnalyticsEvent[] }

export const createRecordingAnalytics = (): RecordingAnalytics => {
  const events: AnalyticsEvent[] = []
  return {
    events,
    track: (event) => {
      events.push(event)
    },
  }
}
