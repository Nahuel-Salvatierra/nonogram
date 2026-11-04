import { IconButton } from '@ui/components/IconButton/IconButton'
import { cn } from '@ui/lib/cn'
import { strings } from '@ui/strings/es'

type GameBannerProps = {
  message: string
  tone: 'info' | 'danger'
  onDismiss?: () => void
}

export function GameBanner({ message, tone, onDismiss }: GameBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex min-h-12 items-center gap-2 rounded-xl px-4 py-1 text-sm font-medium motion-safe:animate-fade-in',
        tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-ink',
      )}
    >
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <IconButton
          icon="close"
          label={strings.common.close}
          onClick={onDismiss}
          className="-mr-2"
        />
      )}
    </div>
  )
}
