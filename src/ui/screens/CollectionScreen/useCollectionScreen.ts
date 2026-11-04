import { useCollectionStore, useGameStore } from '@app/AppRuntimeContext'
import { SIZE_IDS, type SizeId } from '@app/catalog'
import { buildPackViews } from '@app/collection/selectors'
import { useBackButton } from '@app/hooks/useBackButton'
import { useGameActions } from '@app/hooks/useGameActions'
import { ROUTES } from '@ui/routes'
import { strings } from '@ui/strings/es'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

export const SIZE_OPTIONS = SIZE_IDS.map((sizeId) => ({
  value: sizeId,
  label: strings.sizes.names[sizeId],
}))

export const useCollectionScreen = () => {
  const navigate = useNavigate()
  const { openCollectionPuzzle } = useGameActions()
  const record = useCollectionStore((state) => state.record)
  const progress = useCollectionStore((state) => state.progress)
  const activeMode = useGameStore((state) => state.game?.mode ?? null)
  const activeSizeId = useGameStore((state) => state.game?.sizeId ?? null)
  const [sizeId, setSizeId] = useState<SizeId>(activeSizeId ?? '5x5')
  const [pendingPuzzleId, setPendingPuzzleId] = useState<string | null>(null)
  const packs = useMemo(() => buildPackViews(sizeId, record, progress), [sizeId, record, progress])

  const goBack = useCallback(() => void navigate(ROUTES.home), [navigate])
  useBackButton(goBack)

  const open = (puzzleId: string): void => {
    setPendingPuzzleId(null)
    void openCollectionPuzzle(puzzleId)
    void navigate(ROUTES.game)
  }

  return {
    sizeId,
    setSizeId,
    packs,
    goBack,
    pendingPuzzleId,
    openPuzzle: (puzzleId: string) => {
      if (activeMode === 'quick') setPendingPuzzleId(puzzleId)
      else open(puzzleId)
    },
    confirmAbandon: () => {
      if (pendingPuzzleId) open(pendingPuzzleId)
    },
    cancelAbandon: () => setPendingPuzzleId(null),
  }
}
