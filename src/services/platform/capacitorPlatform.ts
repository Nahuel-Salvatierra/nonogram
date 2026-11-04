import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { createNoopPlatform, type PlatformService } from './PlatformService'

const LIGHT_BACKGROUND = '#f8fafc'
const DARK_BACKGROUND = '#0f172a'

export const createCapacitorPlatform = (): PlatformService => {
  if (!Capacitor.isNativePlatform()) return createNoopPlatform()
  return {
    applySystemTheme: async (isDark) => {
      try {
        await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
        await StatusBar.setBackgroundColor({ color: isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND })
      } catch {
        return
      }
    },
    hideSplash: async () => {
      try {
        await SplashScreen.hide()
      } catch {
        return
      }
    },
  }
}
