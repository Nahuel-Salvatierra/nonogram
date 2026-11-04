import type { RewardedResult } from '@app/catalog'
import { useState } from 'react'

type AdStatus = 'idle' | 'watching' | 'unavailable'

export type RewardedAdState = {
  readonly isWatching: boolean
  readonly isUnavailable: boolean
  readonly watch: () => void
}

export const useRewardedAd = (show: () => Promise<RewardedResult>): RewardedAdState => {
  const [status, setStatus] = useState<AdStatus>('idle')

  const watch = (): void => {
    setStatus('watching')
    void show().then((result) => setStatus(result === 'failed' ? 'unavailable' : 'idle'))
  }

  return {
    isWatching: status === 'watching',
    isUnavailable: status === 'unavailable',
    watch,
  }
}
