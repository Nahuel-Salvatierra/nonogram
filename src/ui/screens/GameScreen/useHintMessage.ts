import { useGameStore } from '@app/AppRuntimeContext'
import type { HintInfo } from '@core/game/types'
import { strings } from '@ui/strings/es'

export type BannerMessage = { readonly message: string; readonly tone: 'info' | 'danger' }

const messageOf = (hint: HintInfo): BannerMessage | null => {
  switch (hint.kind) {
    case 'errors':
      return { message: strings.hints.errors(hint.cells.length), tone: 'danger' }
    case 'line':
      return {
        message: strings.hints.line(hint.line.axis, hint.line.index, hint.cells.length),
        tone: 'info',
      }
    case 'reveal':
      return { message: strings.hints.reveal, tone: 'info' }
    case 'exhausted':
      return null
  }
}

export const useHintMessage = (): BannerMessage | null => {
  const hint = useGameStore((state) => state.game?.lastHint ?? null)
  return hint ? messageOf(hint) : null
}
