import { Board } from '@ui/components/Board/Board'
import { GameHeader } from '@ui/components/GameHeader/GameHeader'
import { Toolbar } from '@ui/components/Toolbar/Toolbar'
import { ToolToggle } from '@ui/components/ToolToggle/ToolToggle'
import { strings } from '@ui/strings/es'
import { GameMessages } from './GameMessages'
import { HintAdDialog } from './HintAdDialog'
import { LostOverlay } from './LostOverlay'
import { PauseOverlay } from './PauseOverlay'
import { useGameScreen } from './useGameScreen'

export function GameScreen() {
  const { isReady, isPaused, isLost, isOutOfHints, gameId, tool, setTool, goBack, pause } =
    useGameScreen()

  if (!isReady) {
    return (
      <main className="flex h-full items-center justify-center" aria-busy="true">
        <p className="text-ink-muted motion-safe:animate-pulse">{strings.common.loading}</p>
      </main>
    )
  }

  return (
    <main className="flex h-full flex-col gap-3 px-3 pt-safe pb-safe">
      <GameHeader onBack={goBack} onPause={pause} />
      <GameMessages />
      <Board key={gameId} />
      <div className="flex flex-col gap-2 pb-3">
        <Toolbar />
        <ToolToggle value={tool} onChange={setTool} />
      </div>
      {isPaused && <PauseOverlay />}
      {isLost && <LostOverlay onBack={goBack} />}
      {isOutOfHints && <HintAdDialog />}
    </main>
  )
}
