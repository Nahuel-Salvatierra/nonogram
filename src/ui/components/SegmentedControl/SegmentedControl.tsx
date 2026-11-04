import { cn } from '@ui/lib/cn'

export type SegmentOption<T extends string> = {
  value: T
  label: string
}

type SegmentedControlProps<T extends string> = {
  label: string
  options: readonly SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-xl bg-surface-sunken p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-11 flex-1 rounded-lg px-2 text-sm font-semibold text-ink-muted transition-colors duration-150',
            option.value === value && 'bg-surface-raised text-ink shadow-sm',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
