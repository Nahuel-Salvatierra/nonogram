import { useGameStore } from '@app/AppRuntimeContext'
import { useBackButton } from '@app/hooks/useBackButton'
import { useGameActions } from '@app/hooks/useGameActions'
import { ROUTES } from '@ui/routes'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'

export const useGameScreen = () => {
  const navigate = useNavigate()
  const { pause, setTool } = useGameActions()
  const hasGame = useGameStore((state) => state.game !== null)
  const isStarting = useGameStore((state) => state.isStarting)
  const hasResult = useGameStore((state) => state.lastResult !== null)
  const isPaused = useGameStore((state) => state.game?.status === 'paused')
  const isLost = useGameStore((state) => state.game?.status === 'lost')
  const isOutOfHints = useGameStore(
    (state) => state.game?.status === 'playing' && state.game.lastHint?.kind === 'exhausted',
  )
  const gameId = useGameStore((state) => state.game?.gameId ?? null)
  const tool = useGameStore((state) => state.game?.tool ?? 'fill')
  const mode = useGameStore((state) => state.game?.mode ?? 'quick')

  const goBack = useCallback(() => {
    pause()
    void navigate(mode === 'collection' ? ROUTES.collection : ROUTES.home)
  }, [mode, navigate, pause])

  useBackButton(goBack)

  useEffect(() => {
    if (hasResult) void navigate(ROUTES.victory, { replace: true })
    else if (!hasGame && !isStarting) void navigate(ROUTES.home, { replace: true })
  }, [hasGame, hasResult, isStarting, navigate])

  return {
    isReady: hasGame && !isStarting,
    isPaused,
    isLost,
    isOutOfHints,
    gameId,
    tool,
    setTool,
    goBack,
    pause,
  }
}
