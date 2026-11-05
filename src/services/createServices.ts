import { createNoopAdService } from './ads/AdService'
import { createNoopAnalytics } from './analytics/AnalyticsService'
import type { AppServices } from './AppServices'
import { createCapacitorLifecycle } from './lifecycle/capacitorLifecycle'
import { createCapacitorPlatform } from './platform/capacitorPlatform'
import { createPuzzleSupply } from './puzzles/puzzleSupply'
import { createWorkerGenerator } from './puzzles/workerGenerator'
import { randomId, randomSeed } from './random'
import { createCapacitorStorage } from './storage/capacitorStorage'
import { createPersistence } from './storage/persistence'

export const createServices = (): AppServices => {
  const persistence = createPersistence(createCapacitorStorage())
  return {
    persistence,
    puzzles: createPuzzleSupply({ generator: createWorkerGenerator(), persistence, randomSeed }),
    lifecycle: createCapacitorLifecycle(),
    platform: createCapacitorPlatform(),
    ads: createNoopAdService(),
    analytics: createNoopAnalytics(),
    clock: { now: () => Date.now() },
    createId: randomId,
  }
}
