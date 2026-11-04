import { Button } from '@ui/components/Button/Button'
import { strings } from '@ui/strings/es'
import type { RewardedAdState } from './useRewardedAd'

type WatchAdButtonProps = {
  label: string
  ad: RewardedAdState
}

export function WatchAdButton({ label, ad }: WatchAdButtonProps) {
  return (
    <>
      {ad.isUnavailable && (
        <p role="alert" className="text-sm text-danger">
          {strings.ads.unavailable}
        </p>
      )}
      <Button isFullWidth onClick={ad.watch} disabled={ad.isWatching}>
        {ad.isWatching ? strings.ads.watching : label}
      </Button>
    </>
  )
}
