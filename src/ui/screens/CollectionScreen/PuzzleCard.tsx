import type { PuzzleCardView } from '@app/collection/selectors'
import { PixelArt } from '@ui/components/PixelArt/PixelArt'
import { formatOptionalTime } from '@ui/lib/formatTime'
import { strings } from '@ui/strings/es'
import { memo } from 'react'

const statusLabel = (card: PuzzleCardView): string => {
  if (card.status === 'completed')
    return strings.collection.statusCompleted(formatOptionalTime(card.bestTimeMs))
  if (card.status === 'inProgress')
    return strings.collection.statusInProgress(Math.round(card.progress * 100))
  return strings.collection.statusNew
}

type PuzzleCardProps = {
  card: PuzzleCardView
  onOpen: (puzzleId: string) => void
}

export const PuzzleCard = memo(function PuzzleCard({ card, onOpen }: PuzzleCardProps) {
  const isCompleted = card.status === 'completed'
  const name = isCompleted ? card.name : strings.collection.unknownName

  return (
    <button
      type="button"
      aria-label={strings.collection.puzzleLabel(name, statusLabel(card))}
      onClick={() => onOpen(card.id)}
      className="flex flex-col items-center gap-1 rounded-xl bg-surface-raised p-2 shadow-sm active:bg-accent-soft"
    >
      <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-surface-sunken">
        {isCompleted ? (
          <PixelArt size={card.size} pixels={card.solution} className="w-4/5" />
        ) : (
          <span className="text-2xl font-bold text-ink-subtle">?</span>
        )}
        {card.status === 'inProgress' && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-line">
            <span
              className="block h-full bg-accent"
              style={{ width: `${Math.round(card.progress * 100)}%` }}
            />
          </span>
        )}
      </span>
      <span className="w-full truncate text-xs font-medium">
        {isCompleted ? card.name : strings.difficulty.names[card.difficulty]}
      </span>
      {isCompleted && (
        <span className="text-xs text-ink-muted tabular-nums">
          {formatOptionalTime(card.bestTimeMs)}
        </span>
      )}
    </button>
  )
})
