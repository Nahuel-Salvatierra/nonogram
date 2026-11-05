import type { Difficulty, SizeId } from '@core/engine/difficulty'
import type { GameAction, Tool } from '@core/game/types'
import { useMemo } from 'react'
import { useRuntime } from '../AppRuntimeContext'

export type GameActions = {
  readonly dispatch: (action: GameAction) => void
  readonly openCollectionPuzzle: (puzzleId: string) => Promise<boolean>
  readonly startQuickGame: (sizeId: SizeId, difficulty: Difficulty) => Promise<void>
  readonly setTool: (tool: Tool) => void
  readonly beginStroke: (cell: number) => void
  readonly extendStroke: (cells: readonly number[]) => void
  readonly endStroke: () => void
  readonly undo: () => void
  readonly hint: () => void
  readonly dismissHint: () => void
  readonly pause: () => void
  readonly resume: () => void
  readonly restart: () => void
  readonly retry: () => void
  readonly abandon: () => void
}

export const useGameActions = (): GameActions => {
  const { gameStore, settingsStore, flushSave } = useRuntime()
  return useMemo(() => {
    const dispatch = (action: GameAction): void => gameStore.getState().dispatch(action)
    return {
      dispatch,
      openCollectionPuzzle: (puzzleId) => gameStore.getState().openCollectionPuzzle(puzzleId),
      startQuickGame: async (sizeId, difficulty) => {
        settingsStore.getState().update({ lastSizeId: sizeId, lastDifficulty: difficulty })
        await gameStore.getState().startQuickGame(sizeId, difficulty)
      },
      setTool: (tool) => dispatch({ type: 'setTool', tool }),
      beginStroke: (cell) => dispatch({ type: 'beginStroke', cell }),
      extendStroke: (cells) => dispatch({ type: 'extendStroke', cells }),
      endStroke: () => dispatch({ type: 'endStroke' }),
      undo: () => dispatch({ type: 'undo' }),
      hint: () => gameStore.getState().requestHint(),
      dismissHint: () => dispatch({ type: 'dismissHint' }),
      pause: () => {
        dispatch({ type: 'pause' })
        void flushSave()
      },
      resume: () => dispatch({ type: 'resume' }),
      restart: () => dispatch({ type: 'restart' }),
      retry: () => dispatch({ type: 'retry' }),
      abandon: () => dispatch({ type: 'abandon' }),
    }
  }, [gameStore, settingsStore, flushSave])
}
