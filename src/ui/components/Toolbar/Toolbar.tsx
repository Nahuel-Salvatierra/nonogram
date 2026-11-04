import { useGameStore } from '@app/AppRuntimeContext'
import { useGameActions } from '@app/hooks/useGameActions'
import { strings } from '@ui/strings/es'
import { ToolButton } from './ToolButton'

export function Toolbar() {
  const { undo, hint } = useGameActions()
  const hintsRemaining = useGameStore((state) => state.game?.hintsRemaining ?? 0)
  const canUndo = useGameStore((state) => (state.game?.history.length ?? 0) > 0)
  const isDisabled = useGameStore((state) => state.game?.status !== 'playing')

  return (
    <div className="mx-auto flex w-full max-w-sm justify-around">
      <ToolButton
        icon="undo"
        label={strings.game.undo}
        onClick={undo}
        isDisabled={isDisabled || !canUndo}
      />
      <ToolButton
        icon="bulb"
        label={strings.game.hint}
        ariaLabel={`${strings.game.hint}, ${strings.game.hintsLeft(hintsRemaining)}`}
        onClick={hint}
        isDisabled={isDisabled}
        badge={String(hintsRemaining)}
      />
    </div>
  )
}
