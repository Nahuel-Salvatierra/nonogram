import type { Difficulty, SizeId } from '@core/engine/difficulty'
import { createRecordingAdService, type RecordingAdService } from './ads/AdService'
import { createRecordingAnalytics, type RecordingAnalytics } from './analytics/AnalyticsService'
import type { AppServices } from './AppServices'
import { createManualLifecycle, type ManualLifecycle } from './lifecycle/manualLifecycle'
import { createNoopPlatform } from './platform/PlatformService'
import type { PuzzleSupply } from './puzzles/puzzleSupply'
import type { QuickPuzzle } from './puzzles/quickPuzzle'
import { createMemoryStorage, type MemoryStorage } from './storage/memoryStorage'
import { createPersistence } from './storage/persistence'

export type TestServices = AppServices & {
  readonly storage: MemoryStorage
  readonly lifecycle: ManualLifecycle
  readonly ads: RecordingAdService
  readonly analytics: RecordingAnalytics
  readonly setNow: (now: number) => void
}

export type FixedQuickPuzzle = Pick<QuickPuzzle, 'solution' | 'score' | 'generatorVersion'>

export const createFixedPuzzleSupply = (puzzle: FixedQuickPuzzle): PuzzleSupply => {
  let taken = 0
  return {
    take: async (sizeId: SizeId, difficulty: Difficulty) => {
      taken += 1
      return { ...puzzle, id: `quick-test-${taken}`, sizeId, difficulty }
    },
    refill: async () => undefined,
  }
}

export const createTestServices = (
  puzzle: FixedQuickPuzzle,
  initialStorage: Record<string, string> = {},
): TestServices => {
  const storage = createMemoryStorage(initialStorage)
  let now = 1_000
  let nextId = 1
  return {
    storage,
    persistence: createPersistence(storage),
    puzzles: createFixedPuzzleSupply(puzzle),
    lifecycle: createManualLifecycle(),
    platform: createNoopPlatform(),
    ads: createRecordingAdService(),
    analytics: createRecordingAnalytics(),
    clock: { now: () => now },
    createId: () => `game-${nextId++}`,
    setNow: (value) => {
      now = value
    },
  }
}
