import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ANDROID_DIR = fileURLToPath(new URL('../android/', import.meta.url))
const GRADLEW = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'

const { status } = spawnSync(GRADLEW, ['assembleDebug'], {
  cwd: ANDROID_DIR,
  stdio: 'inherit',
  shell: true,
})
process.exit(status ?? 1)
