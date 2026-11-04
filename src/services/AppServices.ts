import type { AdService } from './ads/AdService'
import type { AnalyticsService } from './analytics/AnalyticsService'
import type { LifecycleService } from './lifecycle/LifecycleService'
import type { PlatformService } from './platform/PlatformService'
import type { PuzzleSupply } from './puzzles/puzzleSupply'
import type { Persistence } from './storage/persistence'

export type Clock = {
  readonly now: () => number
}

export type AppServices = {
  readonly persistence: Persistence
  readonly puzzles: PuzzleSupply
  readonly lifecycle: LifecycleService
  readonly platform: PlatformService
  readonly ads: AdService
  readonly analytics: AnalyticsService
  readonly clock: Clock
  readonly createId: () => string
}
