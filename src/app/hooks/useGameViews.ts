import { useMemo } from 'react'
import { useGameStore, useSettingsStore } from '../AppRuntimeContext'
import { buildCellViews, buildClueViews, type CellView, type ClueViews } from '../game/selectors'

export type GameViews = {
  readonly cells: readonly CellView[]
  readonly clues: ClueViews
}

const EMPTY_VIEWS: GameViews = { cells: [], clues: { rows: [], cols: [] } }

export const useGameViews = (): GameViews => {
  const game = useGameStore((state) => state.game)
  const settings = useSettingsStore((state) => state.settings)
  return useMemo(
    () =>
      game
        ? { cells: buildCellViews(game, settings), clues: buildClueViews(game, settings) }
        : EMPTY_VIEWS,
    [game, settings],
  )
}
