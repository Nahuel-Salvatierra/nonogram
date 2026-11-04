import { useGameStore } from '@app/AppRuntimeContext'
import { tutorialIndexOf } from '@app/collection/selectors'
import { useGameActions } from '@app/hooks/useGameActions'
import { strings } from '@ui/strings/es'
import { useState } from 'react'
import { GameBanner } from './GameBanner'
import { useHintMessage } from './useHintMessage'

const tipFor = (puzzleId: string): string | null => {
  const index = tutorialIndexOf(puzzleId)
  return index === null ? null : (strings.tips[index] ?? null)
}

export function GameMessages() {
  const hint = useHintMessage()
  const { dismissHint } = useGameActions()
  const puzzleId = useGameStore((state) => state.game?.puzzleId ?? '')
  const [dismissedTip, setDismissedTip] = useState<string | null>(null)
  const tip = dismissedTip === puzzleId ? null : tipFor(puzzleId)

  return (
    <div className="mx-auto flex min-h-12 w-full max-w-[480px] flex-col justify-center">
      {hint ? (
        <GameBanner message={hint.message} tone={hint.tone} onDismiss={dismissHint} />
      ) : (
        tip && <GameBanner message={tip} tone="info" onDismiss={() => setDismissedTip(puzzleId)} />
      )}
    </div>
  )
}
