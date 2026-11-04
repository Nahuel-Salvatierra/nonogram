import { ADMOB_TEST_REWARDED_ID, createAdMobAdService } from './ads/admobAdService'
import { createMockAdService, type AdService, type RewardedPresenter } from './ads/AdService'
import { createNoopAnalytics } from './analytics/AnalyticsService'
import type { AppServices } from './AppServices'
import { createCapacitorLifecycle } from './lifecycle/capacitorLifecycle'
import { createCapacitorPlatform } from './platform/capacitorPlatform'
import { createPuzzleSupply } from './puzzles/puzzleSupply'
import { createWorkerGenerator } from './puzzles/workerGenerator'
import { randomId, randomSeed } from './random'
import { createCapacitorStorage } from './storage/capacitorStorage'
import { createPersistence } from './storage/persistence'

export type ServicesOptions = {
  readonly presentMockAd: RewardedPresenter
}

const createAds = ({ presentMockAd }: ServicesOptions): AdService => {
  if (import.meta.env.VITE_ADS_MODE !== 'admob') return createMockAdService(presentMockAd)
  const rewardedId = import.meta.env.VITE_ADMOB_REWARDED_ID
  return createAdMobAdService({
    rewardedId: rewardedId || ADMOB_TEST_REWARDED_ID,
    isTesting: !rewardedId,
  })
}

export const createServices = (options: ServicesOptions): AppServices => {
  const persistence = createPersistence(createCapacitorStorage())
  return {
    persistence,
    puzzles: createPuzzleSupply({ generator: createWorkerGenerator(), persistence, randomSeed }),
    lifecycle: createCapacitorLifecycle(),
    platform: createCapacitorPlatform(),
    ads: createAds(options),
    analytics: createNoopAnalytics(),
    clock: { now: () => Date.now() },
    createId: randomId,
  }
}
