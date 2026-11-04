import type { Theme } from '@core/settings'
import { useEffect, useState } from 'react'
import { useRuntime, useSettingsStore } from '../AppRuntimeContext'

const DARK_QUERY = '(prefers-color-scheme: dark)'

const resolveIsDark = (theme: Theme, prefersDark: boolean): boolean =>
  theme === 'dark' || (theme === 'system' && prefersDark)

export const useThemeSync = (): boolean => {
  const { services } = useRuntime()
  const theme = useSettingsStore((state) => state.settings.theme)
  const [prefersDark, setPrefersDark] = useState(() => window.matchMedia(DARK_QUERY).matches)
  const isDark = resolveIsDark(theme, prefersDark)

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const onChange = (event: MediaQueryListEvent): void => setPrefersDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    void services.platform.applySystemTheme(isDark)
  }, [isDark, services])

  return isDark
}
