import { useGameStore } from '@app/AppRuntimeContext'
import { SIZE_OF } from '@app/catalog'
import { longestClue, strokeCount as strokeCountOf } from '@app/game/selectors'
import { useGameViews } from '@app/hooks/useGameViews'
import { useMemo } from 'react'
import type { BoardLayoutInput } from './boardLayout'

export const useBoard = () => {
  const { cells, clues } = useGameViews()
  const sizeId = useGameStore((state) => state.game?.sizeId ?? '5x5')
  const strokeCount = useGameStore((state) => (state.game ? strokeCountOf(state.game) : null))
  const size = SIZE_OF[sizeId]

  const layout = useMemo<BoardLayoutInput>(
    () => ({
      rows: size.rows,
      cols: size.cols,
      rowClueLength: longestClue(clues.rows.map((view) => view.numbers)),
      colClueLength: longestClue(clues.cols.map((view) => view.numbers)),
    }),
    [size, clues],
  )

  return { size, cells, clues, layout, strokeCount }
}
