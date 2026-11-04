import { APP_VERSION } from '@app/appInfo'
import { useRuntime, useSettingsStore } from '@app/AppRuntimeContext'
import { THEMES, type Settings, type Theme } from '@app/catalog'
import { useBackButton } from '@app/hooks/useBackButton'
import type { SegmentOption } from '@ui/components/SegmentedControl/SegmentedControl'
import { useGoBack } from '@ui/hooks/useGoBack'
import { strings } from '@ui/strings/es'
import { useState } from 'react'

const THEME_OPTIONS: readonly SegmentOption<Theme>[] = THEMES.map((theme) => ({
  value: theme,
  label: strings.settings.themes[theme],
}))

export type BooleanSettingKey = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never
}[keyof Settings]

export const useSettingsScreen = () => {
  const goBack = useGoBack()
  const { statsStore } = useRuntime()
  const settings = useSettingsStore((state) => state.settings)
  const update = useSettingsStore((state) => state.update)
  const [isResetOpen, setIsResetOpen] = useState(false)
  useBackButton(goBack)

  return {
    settings,
    goBack,
    version: APP_VERSION,
    themeOptions: THEME_OPTIONS,
    setTheme: (theme: Theme) => update({ theme }),
    setFlag: (key: BooleanSettingKey, value: boolean) => update({ [key]: value }),
    isResetOpen,
    openReset: () => setIsResetOpen(true),
    closeReset: () => setIsResetOpen(false),
    confirmReset: () => {
      setIsResetOpen(false)
      statsStore.getState().reset()
    },
  }
}
