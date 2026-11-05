import { FREE_HINTS_PER_DAY } from '@app/catalog'
import { useGameActions } from '@app/hooks/useGameActions'
import { Button } from '@ui/components/Button/Button'
import { Modal } from '@ui/components/Modal/Modal'
import { strings } from '@ui/strings/es'

export function HintAdDialog() {
  const { dismissHint } = useGameActions()

  return (
    <Modal isOpen title={strings.hints.exhaustedTitle} onClose={dismissHint}>
      <p className="mb-6 text-ink-muted">{strings.hints.exhaustedMessage(FREE_HINTS_PER_DAY)}</p>
      <Button isFullWidth onClick={dismissHint}>
        {strings.common.close}
      </Button>
    </Modal>
  )
}
