import { cn } from '@ui/lib/cn'

type StatTileProps = {
  label: string
  value: string
  isHighlighted?: boolean
}

export function StatTile({ label, value, isHighlighted = false }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-surface-raised p-4 shadow-sm">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className={cn('text-2xl font-bold tabular-nums', isHighlighted && 'text-accent')}>
        {value}
      </dd>
    </div>
  )
}
