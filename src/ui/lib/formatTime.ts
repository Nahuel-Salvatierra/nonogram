const pad = (value: number): string => value.toString().padStart(2, '0')

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

export const formatOptionalTime = (ms: number | null): string =>
  ms === null ? '—' : formatTime(ms)
