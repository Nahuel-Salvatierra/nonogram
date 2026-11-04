export interface PlatformService {
  applySystemTheme(isDark: boolean): Promise<void>
  hideSplash(): Promise<void>
}

export const createNoopPlatform = (): PlatformService => ({
  applySystemTheme: async () => undefined,
  hideSplash: async () => undefined,
})
