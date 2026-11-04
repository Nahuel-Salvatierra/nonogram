import { DEFAULT_SETTINGS, type Settings } from '@core/settings'
import type { Persistence } from '@services/storage/persistence'
import { createStore, type StoreApi } from 'zustand/vanilla'

export type SettingsStoreState = {
  readonly settings: Settings
  readonly hydrate: (settings: Settings) => void
  readonly update: (patch: Partial<Settings>) => void
}

export type SettingsStore = StoreApi<SettingsStoreState>

export const createSettingsStore = (persistence: Persistence): SettingsStore =>
  createStore<SettingsStoreState>()((set, get) => ({
    settings: DEFAULT_SETTINGS,
    hydrate: (settings) => set({ settings }),
    update: (patch) => {
      const settings = { ...get().settings, ...patch }
      set({ settings })
      void persistence.saveSettings(settings)
    },
  }))
