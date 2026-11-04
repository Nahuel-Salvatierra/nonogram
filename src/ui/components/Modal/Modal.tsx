import { useBackButton } from '@app/hooks/useBackButton'
import { cn } from '@ui/lib/cn'
import { strings } from '@ui/strings/es'
import { useId, type ReactNode } from 'react'

type ModalPlacement = 'center' | 'bottom'

const PLACEMENT_CLASSES: Record<ModalPlacement, { container: string; panel: string }> = {
  center: {
    container: 'items-center justify-center p-6',
    panel: 'w-full max-w-sm rounded-2xl motion-safe:animate-fade-in',
  },
  bottom: {
    container: 'items-end justify-center',
    panel: 'pb-safe w-full max-w-lg rounded-t-3xl motion-safe:animate-slide-up',
  },
}

type ModalProps = {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  placement?: ModalPlacement
}

export function Modal({ isOpen, title, onClose, children, placement = 'center' }: ModalProps) {
  const titleId = useId()
  useBackButton(onClose, isOpen)
  if (!isOpen) return null
  const classes = PLACEMENT_CLASSES[placement]

  return (
    <div className={cn('fixed inset-0 z-50 flex', classes.container)}>
      <button
        type="button"
        aria-label={strings.common.close}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-overlay motion-safe:animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn('relative bg-surface-raised p-6 shadow-xl', classes.panel)}
      >
        <h2 id={titleId} className="mb-3 text-lg font-bold">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
