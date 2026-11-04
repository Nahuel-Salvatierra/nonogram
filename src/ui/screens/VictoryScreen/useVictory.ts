import { useGameStore, useRuntime } from '@app/AppRuntimeContext'
import { useBackButton } from '@app/hooks/useBackButton'
import { useGameActions } from '@app/hooks/useGameActions'
import { ROUTES } from '@ui/routes'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

export const useVictory = () => {
  const navigate = useNavigate()
  const runtime = useRuntime()
  const { openCollectionPuzzle, startQuickGame } = useGameActions()
  const liveResult = useGameStore((state) => state.lastResult)
  const [result] = useState(liveResult)

  const leaveTo = useCallback(
    (route: string) => {
      runtime.gameStore.getState().clearResult()
      void navigate(route, { replace: true })
    },
    [navigate, runtime],
  )

  const goHome = useCallback(() => leaveTo(ROUTES.home), [leaveTo])

  useBackButton(goHome)

  useEffect(() => {
    void runtime.afterVictory()
  }, [runtime])

  return {
    result,
    goHome,
    goCollection: () => leaveTo(ROUTES.collection),
    playNext: () => {
      if (!result) return
      const { summary, nextPuzzleId } = result
      if (summary.mode === 'collection' && nextPuzzleId) void openCollectionPuzzle(nextPuzzleId)
      else void startQuickGame(summary.sizeId, summary.difficulty)
      void navigate(ROUTES.game, { replace: true })
    },
  }
}
