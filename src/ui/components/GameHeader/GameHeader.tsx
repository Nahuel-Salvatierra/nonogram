import { useGameStore, useSettingsStore } from '@app/AppRuntimeContext'
import { useElapsedMs } from '@app/hooks/useElapsedMs'
import { useMistakes } from '@app/hooks/useMistakes'
import { IconButton } from '@ui/components/IconButton/IconButton'
import { formatTime } from '@ui/lib/formatTime'
import { strings } from '@ui/strings/es'

type GameHeaderProps = {
  onBack: () => void
  onPause: () => void
}

export function GameHeader({ onBack, onPause }: GameHeaderProps) {
  const title = useGameStore((state) =>
    state.game?.mode === 'quick'
      ? strings.sizes.names[state.game.sizeId]
      : strings.game.unknownTitle,
  )
  const mistakes = useMistakes()
  const isPlaying = useGameStore((state) => state.game?.status === 'playing')
  const showTimer = useSettingsStore((state) => state.settings.showTimer)
  const elapsedMs = useElapsedMs()

  return (
    <header className="mx-auto flex w-full max-w-[480px] items-center justify-between gap-2">
      <IconButton icon="back" label={strings.common.back} onClick={onBack} />
      <div className="flex flex-1 items-center justify-center gap-4 text-sm text-ink-muted">
        <span className="font-semibold text-ink">{title}</span>
        <span>{strings.game.mistakes(mistakes.count, mistakes.limit)}</span>
        {showTimer && (
          <span className="font-mono tabular-nums" aria-live="off">
            {formatTime(elapsedMs)}
          </span>
        )}
      </div>
      <IconButton
        icon="pause"
        label={strings.game.pause}
        onClick={onPause}
        isDisabled={!isPlaying}
      />
    </header>
  )
}
