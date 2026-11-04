import type { CellView } from '@app/game/selectors'
import { cn } from '@ui/lib/cn'
import { strings } from '@ui/strings/es'
import { memo } from 'react'

const cellLabel = (view: CellView): string =>
  [
    strings.cell.label(view.row, view.col, view.state),
    view.isError && strings.cell.error,
    view.isHinted && strings.cell.hinted,
  ]
    .filter(Boolean)
    .join(', ')

const backgroundOf = (view: CellView): string => {
  if (view.state === 'filled') return view.isHinted ? 'bg-cell-hinted' : 'bg-cell-filled'
  if (view.isError)
    return 'bg-[repeating-linear-gradient(45deg,var(--color-danger-soft)_0_3px,transparent_3px_7px)]'
  return view.isHighlighted ? 'bg-cell-highlight' : 'bg-cell'
}

const crossColorOf = (view: CellView): string => {
  if (view.isError) return 'text-danger'
  return view.isHinted ? 'text-cell-hinted' : 'text-cell-crossed'
}

type CellProps = { view: CellView }

export const Cell = memo(function Cell({ view }: CellProps) {
  return (
    <div
      role="img"
      aria-label={cellLabel(view)}
      data-cell={view.cell}
      data-state={view.state}
      className={cn(
        'relative flex items-center justify-center border-line',
        view.col > 0 && 'border-l',
        view.row > 0 && 'border-t',
        view.hasGuideRight && 'border-r-2 border-r-line-guide',
        view.hasGuideBottom && 'border-b-2 border-b-line-guide',
        backgroundOf(view),
        view.isHintTarget && 'ring-3 ring-accent ring-inset motion-safe:animate-pulse',
      )}
    >
      {view.state === 'crossed' && (
        <svg
          viewBox="0 0 10 10"
          aria-hidden="true"
          className={cn('pointer-events-none size-1/2', crossColorOf(view))}
        >
          <path
            d="M1 1 9 9M9 1 1 9"
            stroke="currentColor"
            strokeWidth={view.isError ? 2.2 : 1.4}
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  )
})
