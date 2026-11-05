import { createContext, useContext, type ReactNode } from 'react'
import { useStore } from 'zustand'
import type { AppRuntime } from './runtime/createAppRuntime'
import type { CollectionStoreState } from './stores/collectionStore'
import type { GameStoreState } from './stores/gameStore'
import type { SettingsStoreState } from './stores/settingsStore'
import type { StatsStoreState } from './stores/statsStore'

const AppRuntimeContext = createContext<AppRuntime | null>(null)

type AppRuntimeProviderProps = {
  runtime: AppRuntime
  children: ReactNode
}

export function AppRuntimeProvider({ runtime, children }: AppRuntimeProviderProps) {
  return <AppRuntimeContext.Provider value={runtime}>{children}</AppRuntimeContext.Provider>
}

export const useRuntime = (): AppRuntime => {
  const runtime = useContext(AppRuntimeContext)
  if (!runtime) throw new Error('useRuntime must be used inside AppRuntimeProvider')
  return runtime
}

export const useGameStore = <T,>(selector: (state: GameStoreState) => T): T =>
  useStore(useRuntime().gameStore, selector)

export const useSettingsStore = <T,>(selector: (state: SettingsStoreState) => T): T =>
  useStore(useRuntime().settingsStore, selector)

export const useStatsStore = <T,>(selector: (state: StatsStoreState) => T): T =>
  useStore(useRuntime().statsStore, selector)

export const useCollectionStore = <T,>(selector: (state: CollectionStoreState) => T): T =>
  useStore(useRuntime().collectionStore, selector)
