import type { PackView } from '@app/collection/selectors'
import { strings } from '@ui/strings/es'
import { PuzzleCard } from './PuzzleCard'

type PackSectionProps = {
  pack: PackView
  onOpen: (puzzleId: string) => void
}

export function PackSection({ pack, onOpen }: PackSectionProps) {
  const titleId = `pack-${pack.id}`
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 id={titleId} className="text-lg font-bold">
          {pack.title}
        </h2>
        <span className="text-sm text-ink-muted tabular-nums">
          {strings.collection.packProgress(pack.completed, pack.total)}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {pack.puzzles.map((card) => (
          <PuzzleCard key={card.id} card={card} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}
