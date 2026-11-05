export type BannerPlacement = 'home' | 'stats'
export type InterstitialPlacement = 'afterVictory'
export type RewardedPlacement = 'extraHint' | 'continueAfterLoss'
export type RewardedResult = 'rewarded' | 'dismissed' | 'failed'

export interface AdService {
  showBanner(placement: BannerPlacement): Promise<void>
  hideBanner(): Promise<void>
  showInterstitial(placement: InterstitialPlacement): Promise<boolean>
  showRewarded(placement: RewardedPlacement): Promise<RewardedResult>
}

export const createNoopAdService = (): AdService => ({
  showBanner: async () => undefined,
  hideBanner: async () => undefined,
  showInterstitial: async () => false,
  showRewarded: async () => 'failed',
})

export type RecordingAdService = AdService & {
  readonly rewardedRequests: readonly RewardedPlacement[]
  readonly setRewardedResult: (result: RewardedResult) => void
}

export const createRecordingAdService = (): RecordingAdService => {
  const rewardedRequests: RewardedPlacement[] = []
  let rewardedResult: RewardedResult = 'failed'
  return {
    ...createNoopAdService(),
    rewardedRequests,
    setRewardedResult: (result) => {
      rewardedResult = result
    },
    showRewarded: async (placement) => {
      rewardedRequests.push(placement)
      return rewardedResult
    },
  }
}
