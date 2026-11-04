import { Icon, type IconName } from '@ui/components/Icon/Icon'
import { cn } from '@ui/lib/cn'

type IconButtonProps = {
  icon: IconName
  label: string
  onClick: () => void
  className?: string
  isDisabled?: boolean
}

export function IconButton({
  icon,
  label,
  onClick,
  className,
  isDisabled = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink active:bg-surface-sunken disabled:opacity-40',
        className,
      )}
    >
      <Icon name={icon} />
    </button>
  )
}
