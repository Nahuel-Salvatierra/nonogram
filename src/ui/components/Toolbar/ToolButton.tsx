import { Icon, type IconName } from '@ui/components/Icon/Icon'

type ToolButtonProps = {
  icon: IconName
  label: string
  onClick: () => void
  isDisabled?: boolean
  badge?: string
  ariaLabel?: string
}

export function ToolButton({
  icon,
  label,
  onClick,
  isDisabled = false,
  badge,
  ariaLabel,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      disabled={isDisabled}
      onClick={onClick}
      className="relative flex min-h-14 min-w-20 flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs font-medium text-ink-muted active:bg-surface-sunken disabled:opacity-40"
    >
      <Icon name={icon} />
      <span>{label}</span>
      {badge !== undefined && (
        <span className="absolute top-1 right-3 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.7rem] leading-5 font-bold text-accent-ink">
          {badge}
        </span>
      )}
    </button>
  )
}
