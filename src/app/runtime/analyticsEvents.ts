import type { GameEvent } from '@core/game/events'
import type { AnalyticsEvent } from '@services/analytics/AnalyticsService'

export const toAnalyticsEvent = (event: GameEvent): AnalyticsEvent | null => {
  switch (event.type) {
    case 'gameStarted':
      return {
        name: 'game_started',
        params: { mode: event.mode, size: event.sizeId, difficulty: event.difficulty },
      }
    case 'gameCompleted':
      return {
        name: 'game_completed',
        params: {
          mode: event.summary.mode,
          size: event.summary.sizeId,
          difficulty: event.summary.difficulty,
          elapsed_ms: event.summary.elapsedMs,
          mistakes: event.summary.mistakes,
          hints: event.summary.hintsUsed,
        },
      }
    case 'gameLost':
      return {
        name: 'game_lost',
        params: {
          mode: event.summary.mode,
          size: event.summary.sizeId,
          difficulty: event.summary.difficulty,
          elapsed_ms: event.summary.elapsedMs,
        },
      }
    case 'gameContinued':
      return { name: 'game_continued' }
    case 'gameAbandoned':
      return {
        name: 'game_abandoned',
        params: {
          mode: event.summary.mode,
          size: event.summary.sizeId,
          difficulty: event.summary.difficulty,
          elapsed_ms: event.summary.elapsedMs,
          progress: Math.round(event.progress * 100),
        },
      }
    case 'hintUsed':
      return {
        name: 'hint_used',
        params: { kind: event.kind, remaining: event.hintsRemaining, rewarded: event.isRewarded },
      }
    case 'hintsExhausted':
      return { name: 'hints_exhausted' }
    default:
      return null
  }
}
