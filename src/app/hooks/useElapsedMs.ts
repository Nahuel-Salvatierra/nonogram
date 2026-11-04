import { getElapsedMs } from '@core/game/timer'
import { useEffect, useState } from 'react'
import { useGameStore, useRuntime } from '../AppRuntimeContext'

const DISPLAY_INTERVAL_MS = 500

export const useElapsedMs = (): number => {
  const { services } = useRuntime()
  const game = useGameStore((state) => state.game)
  const [now, setNow] = useState(() => services.clock.now())
  const isRunning = game?.runningSince !== null && game?.runningSince !== undefined

  useEffect(() => {
    if (!isRunning) return undefined
    const interval = setInterval(() => setNow(services.clock.now()), DISPLAY_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isRunning, services])

  return game ? getElapsedMs(game, now) : 0
}
