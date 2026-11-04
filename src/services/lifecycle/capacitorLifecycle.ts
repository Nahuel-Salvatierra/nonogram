import { App } from '@capacitor/app'
import { Capacitor, type PluginListenerHandle } from '@capacitor/core'
import type { LifecycleService, Unsubscribe } from './LifecycleService'

const removeLater =
  (handle: Promise<PluginListenerHandle>): Unsubscribe =>
  () => {
    void handle.then((listener) => listener.remove())
  }

export const createCapacitorLifecycle = (): LifecycleService => {
  const isNative = Capacitor.isNativePlatform()
  return {
    onActiveChange: (listener) => {
      const onVisibility = (): void => listener(document.visibilityState === 'visible')
      document.addEventListener('visibilitychange', onVisibility)
      const native = isNative
        ? removeLater(App.addListener('appStateChange', ({ isActive }) => listener(isActive)))
        : () => undefined
      return () => {
        document.removeEventListener('visibilitychange', onVisibility)
        native()
      }
    },
    onBackButton: (listener) =>
      isNative ? removeLater(App.addListener('backButton', () => listener())) : () => undefined,
    exitApp: () => {
      if (isNative) void App.exitApp()
    },
  }
}
