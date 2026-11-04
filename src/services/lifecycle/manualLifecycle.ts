import type { LifecycleService } from './LifecycleService'

export type ManualLifecycle = LifecycleService & {
  readonly setActive: (isActive: boolean) => void
  readonly pressBack: () => void
  readonly exitCount: () => number
}

export const createManualLifecycle = (): ManualLifecycle => {
  const activeListeners = new Set<(isActive: boolean) => void>()
  const backListeners = new Set<() => void>()
  let exits = 0
  return {
    onActiveChange: (listener) => {
      activeListeners.add(listener)
      return () => activeListeners.delete(listener)
    },
    onBackButton: (listener) => {
      backListeners.add(listener)
      return () => backListeners.delete(listener)
    },
    exitApp: () => {
      exits++
    },
    setActive: (isActive) => activeListeners.forEach((listener) => listener(isActive)),
    pressBack: () => [...backListeners].at(-1)?.(),
    exitCount: () => exits,
  }
}
