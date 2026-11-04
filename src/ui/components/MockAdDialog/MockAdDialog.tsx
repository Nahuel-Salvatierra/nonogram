import { useMockAdStore } from '@app/AppRuntimeContext'
import { Button } from '@ui/components/Button/Button'
import { Modal } from '@ui/components/Modal/Modal'
import { strings } from '@ui/strings/es'

export function MockAdDialog() {
  const placement = useMockAdStore((state) => state.placement)
  const resolve = useMockAdStore((state) => state.resolve)
  const close = (): void => resolve('dismissed')

  return (
    <Modal isOpen={placement !== null} title={strings.ads.mockTitle} onClose={close}>
      {placement && <p className="mb-6 text-ink-muted">{strings.ads.mockMessages[placement]}</p>}
      <div className="flex flex-col gap-3">
        <Button isFullWidth onClick={() => resolve('rewarded')}>
          {strings.ads.mockFinish}
        </Button>
        <Button variant="secondary" isFullWidth onClick={close}>
          {strings.ads.mockClose}
        </Button>
      </div>
    </Modal>
  )
}
