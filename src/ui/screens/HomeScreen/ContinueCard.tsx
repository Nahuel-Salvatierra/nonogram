import { useElapsedMs } from '@app/hooks/useElapsedMs'
import type { Difficulty, SizeId } from '@app/catalog'
import { Icon } from '@ui/components/Icon/Icon'
import { formatTime } from '@ui/lib/formatTime'
import { strings } from '@ui/strings/es'

type ContinueCardProps = {
  sizeId: SizeId
  difficulty: Difficulty
  onContinue: () => void
}

export function ContinueCard({ sizeId, difficulty, onContinue }: ContinueCardProps) {
  const elapsedMs = useElapsedMs()
  const title = strings.home.quickTitle(
    strings.sizes.names[sizeId],
    strings.difficulty.names[difficulty],
  )

  return (
    <button
      type="button"
      onClick={onContinue}
      className="flex min-h-20 w-full items-center gap-4 rounded-2xl bg-accent px-5 text-left text-accent-ink shadow-md active:opacity-90"
    >
      <Icon name="play" className="size-8" />
      <span className="flex flex-col">
        <span className="text-lg font-bold">{strings.home.continue}</span>
        <span className="text-sm opacity-85">
          {strings.home.continueDetail(title, formatTime(elapsedMs))}
        </span>
      </span>
    </button>
  )
}
