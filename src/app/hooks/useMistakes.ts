import { MAX_MISTAKES } from '@core/game/createGame'
import { useGameStore, useSettingsStore } from '../AppRuntimeContext'

export type MistakesView = {
  readonly count: number
  readonly limit: number | null
}

export const useMistakes = (): MistakesView => {
  const count = useGameStore((state) => state.game?.mistakes ?? 0)
  const autoValidate = useSettingsStore((state) => state.settings.autoValidate)
  return { count, limit: autoValidate ? MAX_MISTAKES : null }
}
