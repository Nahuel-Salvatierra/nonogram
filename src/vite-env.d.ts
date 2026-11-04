/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_ADS_MODE?: string
  readonly VITE_ADMOB_REWARDED_ID?: string
}
