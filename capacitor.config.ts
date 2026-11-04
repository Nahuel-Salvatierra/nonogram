import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.punky.nonogram',
  appName: 'Nonogram',
  webDir: 'dist',
  android: {
    backgroundColor: '#d8effc',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#d8effc',
      showSpinner: false,
    },
    SystemBars: {
      insetsHandling: 'css',
    },
  },
}

export default config
