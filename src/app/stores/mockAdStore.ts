import type { RewardedPlacement, RewardedResult } from '@services/ads/AdService'
import { createStore, type StoreApi } from 'zustand/vanilla'

export type MockAdStoreState = {
  readonly placement: RewardedPlacement | null
  readonly present: (placement: RewardedPlacement) => Promise<RewardedResult>
  readonly resolve: (result: RewardedResult) => void
}

export type MockAdStore = StoreApi<MockAdStoreState>

export const createMockAdStore = (): MockAdStore =>
  createStore<MockAdStoreState>()((set) => {
    let pending: ((result: RewardedResult) => void) | null = null

    const settle = (result: RewardedResult): void => {
      const resolvePending = pending
      pending = null
      set({ placement: null })
      resolvePending?.(result)
    }

    return {
      placement: null,
      present: (placement) => {
        settle('dismissed')
        return new Promise<RewardedResult>((resolve) => {
          pending = resolve
          set({ placement })
        })
      },
      resolve: settle,
    }
  })
