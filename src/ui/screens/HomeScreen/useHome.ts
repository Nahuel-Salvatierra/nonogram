import {
  useCollectionStore,
  useGameStore,
  useSettingsStore,
  useStatsStore,
} from '@app/AppRuntimeContext'
import type { Difficulty, SizeId } from '@app/catalog'
import { overallProgress } from '@app/collection/selectors'
import { useGameActions } from '@app/hooks/useGameActions'
import { ROUTES } from '@ui/routes'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

export type QuickChoice = { readonly sizeId: SizeId; readonly difficulty: Difficulty }

export const useHome = () => {
  const navigate = useNavigate()
  const { startQuickGame, resume } = useGameActions()
  const activeGame = useGameStore((state) => state.game)
  const stats = useStatsStore((state) => state.stats)
  const lastSizeId = useSettingsStore((state) => state.settings.lastSizeId)
  const record = useCollectionStore((state) => state.record)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [pendingChoice, setPendingChoice] = useState<QuickChoice | null>(null)

  const collectionProgress = useMemo(() => overallProgress(record), [record])

  const start = ({ sizeId, difficulty }: QuickChoice): void => {
    setPendingChoice(null)
    void startQuickGame(sizeId, difficulty)
    void navigate(ROUTES.game)
  }

  return {
    activeGame,
    stats,
    lastSizeId,
    collectionProgress,
    isSheetOpen,
    pendingChoice,
    openSheet: () => setIsSheetOpen(true),
    closeSheet: () => setIsSheetOpen(false),
    continueGame: () => {
      resume()
      void navigate(ROUTES.game)
    },
    chooseQuick: (choice: QuickChoice) => {
      setIsSheetOpen(false)
      if (activeGame?.mode === 'quick') setPendingChoice(choice)
      else start(choice)
    },
    confirmAbandon: () => {
      if (pendingChoice) start(pendingChoice)
    },
    cancelAbandon: () => setPendingChoice(null),
    openCollection: () => void navigate(ROUTES.collection),
    openStats: () => void navigate(ROUTES.stats),
    openSettings: () => void navigate(ROUTES.settings),
    openHowToPlay: () => void navigate(ROUTES.howToPlay),
  }
}
