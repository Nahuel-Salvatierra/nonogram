import { cn } from '@ui/lib/cn'

type ToggleProps = {
  label: string
  description?: string
  isChecked: boolean
  onChange: (isChecked: boolean) => void
}

export function Toggle({ label, description, isChecked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={() => onChange(!isChecked)}
      className="flex min-h-14 w-full items-center justify-between gap-4 py-2 text-left"
    >
      <span className="flex flex-col">
        <span className="font-medium">{label}</span>
        {description && <span className="text-sm text-ink-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150',
          isChecked ? 'bg-accent' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 size-5 rounded-full bg-surface-raised shadow transition-transform duration-150',
            isChecked && 'translate-x-5',
          )}
        />
      </span>
    </button>
  )
}
