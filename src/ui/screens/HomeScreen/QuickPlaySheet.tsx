import { DIFFICULTIES_BY_SIZE, SIZE_IDS, type SizeId } from '@app/catalog'
import { bestTimeOf } from '@app/stats/selectors'
import type { Stats } from '@core/stats/stats'
import { Modal } from '@ui/components/Modal/Modal'
import { SegmentedControl } from '@ui/components/SegmentedControl/SegmentedControl'
import { formatTime } from '@ui/lib/formatTime'
import { strings } from '@ui/strings/es'
import { useState } from 'react'
import type { QuickChoice } from './useHome'

const SIZE_OPTIONS = SIZE_IDS.map((sizeId) => ({
  value: sizeId,
  label: strings.sizes.names[sizeId],
}))

type QuickPlaySheetProps = {
  isOpen: boolean
  stats: Stats
  initialSizeId: SizeId
  onChoose: (choice: QuickChoice) => void
  onClose: () => void
}

export function QuickPlaySheet({
  isOpen,
  stats,
  initialSizeId,
  onChoose,
  onClose,
}: QuickPlaySheetProps) {
  const [sizeId, setSizeId] = useState<SizeId>(initialSizeId)

  return (
    <Modal isOpen={isOpen} title={strings.quickPlay.title} onClose={onClose} placement="bottom">
      <div className="flex flex-col gap-4">
        <SegmentedControl
          label={strings.quickPlay.size}
          options={SIZE_OPTIONS}
          value={sizeId}
          onChange={setSizeId}
        />
        <ul className="flex flex-col gap-2" aria-label={strings.quickPlay.difficulty}>
          {DIFFICULTIES_BY_SIZE[sizeId].map((difficulty) => {
            const bestTimeMs = bestTimeOf(stats, sizeId, difficulty)
            return (
              <li key={difficulty}>
                <button
                  type="button"
                  onClick={() => onChoose({ sizeId, difficulty })}
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-surface-sunken px-4 py-3 text-left font-semibold active:bg-accent-soft"
                >
                  {strings.difficulty.names[difficulty]}
                  {bestTimeMs !== null && (
                    <span className="shrink-0 text-sm font-medium text-accent tabular-nums">
                      {strings.difficulty.bestTime(formatTime(bestTimeMs))}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </Modal>
  )
}
