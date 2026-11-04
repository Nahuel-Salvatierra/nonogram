import type { GameAction } from '@core/game/types'
import type { AdService, RewardedResult } from '@services/ads/AdService'
import type { GameStore } from '../stores/gameStore'

export type RewardedAds = {
  readonly watchForHint: () => Promise<RewardedResult>
  readonly watchToContinue: () => Promise<RewardedResult>
}

export const createRewardedAds = (ads: AdService, gameStore: GameStore): RewardedAds => {
  const dispatch = (action: GameAction): void => gameStore.getState().dispatch(action)

  return {
    watchForHint: async () => {
      const result = await ads.showRewarded('extraHint')
      if (result !== 'rewarded') return result
      if (gameStore.getState().game?.status === 'paused') dispatch({ type: 'resume' })
      dispatch({ type: 'hint', isRewarded: true })
      return result
    },
    watchToContinue: async () => {
      const result = await ads.showRewarded('continueAfterLoss')
      if (result === 'rewarded') dispatch({ type: 'continue' })
      return result
    },
  }
}
