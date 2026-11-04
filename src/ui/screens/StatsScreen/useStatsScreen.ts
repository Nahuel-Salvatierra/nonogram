import { useCollectionStore, useStatsStore } from '@app/AppRuntimeContext'
import { DIFFICULTIES, SIZE_IDS } from '@app/catalog'
import { sizeProgress } from '@app/collection/selectors'
import { useBackButton } from '@app/hooks/useBackButton'
import { selectStatsView, type DifficultyScope, type SizeScope } from '@app/stats/selectors'
import type { SegmentOption } from '@ui/components/SegmentedControl/SegmentedControl'
import { useGoBack } from '@ui/hooks/useGoBack'
import { strings } from '@ui/strings/es'
import { useMemo, useState } from 'react'

const SIZE_OPTIONS: readonly SegmentOption<SizeScope>[] = [
  { value: 'all', label: strings.stats.all },
  ...SIZE_IDS.map((sizeId) => ({ value: sizeId, label: strings.sizes.names[sizeId] })),
]

const DIFFICULTY_OPTIONS: readonly SegmentOption<DifficultyScope>[] = [
  { value: 'all', label: strings.stats.all },
  ...DIFFICULTIES.map((difficulty) => ({
    value: difficulty,
    label: strings.difficulty.names[difficulty],
  })),
]

export const useStatsScreen = () => {
  const goBack = useGoBack()
  const stats = useStatsStore((state) => state.stats)
  const record = useCollectionStore((state) => state.record)
  const [size, setSize] = useState<SizeScope>('all')
  const [difficulty, setDifficulty] = useState<DifficultyScope>('all')
  const view = useMemo(() => selectStatsView(stats, size, difficulty), [stats, size, difficulty])
  const collection = useMemo(
    () => SIZE_IDS.map((sizeId) => ({ sizeId, ...sizeProgress(sizeId, record) })),
    [record],
  )
  useBackButton(goBack)

  return {
    size,
    setSize,
    difficulty,
    setDifficulty,
    view,
    collection,
    goBack,
    sizeOptions: SIZE_OPTIONS,
    difficultyOptions: DIFFICULTY_OPTIONS,
  }
}
