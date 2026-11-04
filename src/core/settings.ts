import type { Difficulty, SizeId } from './engine/difficulty'
import type { GameSettings } from './game/types'

export const THEMES = ['system', 'light', 'dark'] as const

export type Theme = (typeof THEMES)[number]

export type Settings = {
  readonly theme: Theme
  readonly autoValidate: boolean
  readonly dimCompletedClues: boolean
  readonly autoCross: boolean
  readonly highlightLines: boolean
  readonly showTimer: boolean
  readonly lastSizeId: SizeId
  readonly lastDifficulty: Difficulty
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  autoValidate: true,
  dimCompletedClues: true,
  autoCross: true,
  highlightLines: true,
  showTimer: true,
  lastSizeId: '10x10',
  lastDifficulty: 'easy',
}

export const gameSettingsOf = (settings: Settings): GameSettings => ({
  autoValidate: settings.autoValidate,
  autoCross: settings.autoCross,
})
