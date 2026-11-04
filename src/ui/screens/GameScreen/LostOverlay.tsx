import { MAX_MISTAKES } from '@app/catalog'
import { useGameActions } from '@app/hooks/useGameActions'
import { Button } from '@ui/components/Button/Button'
import { Modal } from '@ui/components/Modal/Modal'
import { strings } from '@ui/strings/es'
import { useRewardedAd } from './useRewardedAd'
import { WatchAdButton } from './WatchAdButton'

type LostOverlayProps = {
  onBack: () => void
}

export function LostOverlay({ onBack }: LostOverlayProps) {
  const { retry, watchAdToContinue } = useGameActions()
  const ad = useRewardedAd(watchAdToContinue)

  return (
    <Modal isOpen title={strings.lost.title} onClose={onBack}>
      <p className="mb-6 text-ink-muted">{strings.lost.message(MAX_MISTAKES)}</p>
      <div className="flex flex-col gap-3">
        <WatchAdButton label={strings.lost.continue} ad={ad} />
        <Button variant="secondary" isFullWidth onClick={retry} disabled={ad.isWatching}>
          {strings.lost.retry}
        </Button>
        <Button variant="ghost" isFullWidth onClick={onBack} disabled={ad.isWatching}>
          {strings.lost.back}
        </Button>
      </div>
    </Modal>
  )
}
