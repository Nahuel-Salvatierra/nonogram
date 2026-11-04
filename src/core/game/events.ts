import type { Difficulty, SizeId } from '../engine/difficulty'
import type { GameMode, GameState, HintInfo } from './types'

export type GameSummary = {
  readonly gameId: string
  readonly puzzleId: string
  readonly mode: GameMode
  readonly sizeId: SizeId
  readonly difficulty: Difficulty
  readonly elapsedMs: number
  readonly mistakes: number
  readonly hintsUsed: number
}

export type GameEvent =
  | {
      readonly type: 'gameStarted'
      readonly gameId: string
      readonly puzzleId: string
      readonly mode: GameMode
      readonly sizeId: SizeId
      readonly difficulty: Difficulty
    }
  | { readonly type: 'mistakeMade'; readonly cell: number }
  | {
      readonly type: 'hintUsed'
      readonly gameId: string
      readonly kind: HintInfo['kind']
      readonly hintsRemaining: number
      readonly isRewarded: boolean
    }
  | { readonly type: 'hintsExhausted'; readonly gameId: string }
  | { readonly type: 'gamePaused' }
  | { readonly type: 'gameResumed' }
  | { readonly type: 'gameRestarted'; readonly gameId: string }
  | { readonly type: 'gameLost'; readonly summary: GameSummary }
  | { readonly type: 'gameContinued'; readonly gameId: string }
  | { readonly type: 'gameCompleted'; readonly summary: GameSummary }
  | { readonly type: 'gameAbandoned'; readonly summary: GameSummary; readonly progress: number }

export type GameResult = {
  readonly state: GameState
  readonly events: readonly GameEvent[]
}
