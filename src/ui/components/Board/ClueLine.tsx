import type { ClueView } from '@app/game/selectors'
import { cn } from '@ui/lib/cn'
import { strings } from '@ui/strings/es'
import { memo } from 'react'
import { CLUE_SLOT } from './boardLayout'

type ClueLineProps = { view: ClueView }

const SLOT = `calc(var(--base) * ${CLUE_SLOT})`

export const ClueLine = memo(function ClueLine({ view }: ClueLineProps) {
  const numbers = view.numbers.length === 0 ? [0] : view.numbers
  const isRow = view.axis === 'row'
  return (
    <div
      data-clue={`${view.axis}-${view.index}`}
      data-done={view.isDone}
      className={cn(
        'flex justify-end font-semibold tabular-nums transition-colors duration-150',
        isRow ? 'flex-row items-center pr-1' : 'flex-col items-center pb-1',
        view.isDone ? 'text-clue-done' : 'text-ink',
        (view.isActive || view.isHintLine) && 'rounded-sm bg-cell-highlight',
        view.isHintLine && 'text-accent',
      )}
      style={{ fontSize: 'max(11px, calc(var(--base) * 0.5))' }}
    >
      <span className="sr-only">
        {strings.clue.label(view.axis, view.index, view.numbers, view.isDone)}
      </span>
      {numbers.map((number, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="flex items-center justify-center leading-none"
          style={isRow ? { width: SLOT } : { height: SLOT }}
        >
          {number}
        </span>
      ))}
    </div>
  )
})
