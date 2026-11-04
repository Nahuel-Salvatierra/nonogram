import { useGameStore } from '@app/AppRuntimeContext'
import { useElapsedMs } from '@app/hooks/useElapsedMs'
import { useGameActions } from '@app/hooks/useGameActions'
import { useMistakes } from '@app/hooks/useMistakes'
import { Button } from '@ui/components/Button/Button'
import { ConfirmDialog } from '@ui/components/ConfirmDialog/ConfirmDialog'
import { formatTime } from '@ui/lib/formatTime'
import { ROUTES } from '@ui/routes'
import { strings } from '@ui/strings/es'
import { useState } from 'react'
import { useNavigate } from 'react-router'

type PendingConfirm = 'restart' | 'abandon' | null

export function PauseOverlay() {
  const navigate = useNavigate()
  const { resume, restart, abandon } = useGameActions()
  const sizeId = useGameStore((state) => state.game?.sizeId ?? '5x5')
  const difficulty = useGameStore((state) => state.game?.difficulty ?? 'easy')
  const mistakes = useMistakes()
  const elapsedMs = useElapsedMs()
  const [pending, setPending] = useState<PendingConfirm>(null)

  const confirmRestart = (): void => {
    setPending(null)
    restart()
    resume()
  }

  const confirmAbandon = (): void => {
    setPending(null)
    abandon()
    void navigate(ROUTES.home, { replace: true })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={strings.pause.title}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-surface px-8 pt-safe pb-safe motion-safe:animate-fade-in"
    >
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-3xl font-bold">{strings.pause.title}</h2>
        <p className="text-4xl font-semibold tabular-nums">{formatTime(elapsedMs)}</p>
        <p className="text-ink-muted">
          {strings.sizes.names[sizeId]} · {strings.difficulty.names[difficulty]} ·{' '}
          {strings.game.mistakes(mistakes.count, mistakes.limit)}
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button isFullWidth onClick={resume}>
          {strings.pause.resume}
        </Button>
        <Button variant="secondary" isFullWidth onClick={() => setPending('restart')}>
          {strings.pause.restart}
        </Button>
        <Button variant="secondary" isFullWidth onClick={() => void navigate(ROUTES.settings)}>
          {strings.pause.settings}
        </Button>
        <Button
          variant="ghost"
          isFullWidth
          className="text-danger"
          onClick={() => setPending('abandon')}
        >
          {strings.pause.abandon}
        </Button>
      </div>
      <ConfirmDialog
        isOpen={pending === 'restart'}
        title={strings.pause.restartTitle}
        message={strings.pause.restartMessage}
        confirmLabel={strings.pause.restart}
        onConfirm={confirmRestart}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        isOpen={pending === 'abandon'}
        title={strings.pause.abandonTitle}
        message={strings.pause.abandonMessage}
        confirmLabel={strings.pause.abandon}
        onConfirm={confirmAbandon}
        onCancel={() => setPending(null)}
        isDestructive
      />
    </div>
  )
}
