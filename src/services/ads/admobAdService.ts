import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob'
import { Capacitor } from '@capacitor/core'
import { createNoopAdService, type AdService, type RewardedResult } from './AdService'

export const ADMOB_TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917'

export type AdMobConfig = {
  readonly rewardedId: string
  readonly isTesting: boolean
}

const showRewardedAd = async ({ rewardedId, isTesting }: AdMobConfig): Promise<RewardedResult> => {
  let isRewarded = false
  let settle: (result: RewardedResult) => void = () => undefined
  const outcome = new Promise<RewardedResult>((resolve) => {
    settle = resolve
  })
  const listeners = await Promise.all([
    AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
      isRewarded = true
    }),
    AdMob.addListener(RewardAdPluginEvents.Dismissed, () =>
      settle(isRewarded ? 'rewarded' : 'dismissed'),
    ),
    AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => settle('failed')),
  ])
  try {
    await AdMob.prepareRewardVideoAd({ adId: rewardedId, isTesting, npa: true })
    void AdMob.showRewardVideoAd().catch(() => settle('failed'))
    return await outcome
  } catch {
    return 'failed'
  } finally {
    await Promise.all(listeners.map((listener) => listener.remove()))
  }
}

export const createAdMobAdService = (config: AdMobConfig): AdService => {
  if (!Capacitor.isNativePlatform()) return createNoopAdService()
  let initialized: Promise<void> | null = null

  return {
    ...createNoopAdService(),
    showRewarded: async () => {
      initialized ??= AdMob.initialize()
      try {
        await initialized
      } catch {
        initialized = null
        return 'failed'
      }
      return showRewardedAd(config)
    },
  }
}
