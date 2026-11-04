import { FREE_HINTS_PER_DAY } from '@app/catalog'
import { useGameActions } from '@app/hooks/useGameActions'
import { Button } from '@ui/components/Button/Button'
import { Modal } from '@ui/components/Modal/Modal'
import { strings } from '@ui/strings/es'
import { useRewardedAd } from './useRewardedAd'
import { WatchAdButton } from './WatchAdButton'

export function HintAdDialog() {
  const { dismissHint, watchAdForHint } = useGameActions()
  const ad = useRewardedAd(watchAdForHint)

  return (
    <Modal isOpen title={strings.ads.hintTitle} onClose={dismissHint}>
      <p className="mb-6 text-ink-muted">{strings.ads.hintMessage(FREE_HINTS_PER_DAY)}</p>
      <div className="flex flex-col gap-3">
        <WatchAdButton label={strings.ads.watch} ad={ad} />
        <Button variant="secondary" isFullWidth onClick={dismissHint}>
          {strings.ads.later}
        </Button>
      </div>
    </Modal>
  )
}
