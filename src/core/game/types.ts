import type { Clues, Solution } from '../engine/clues'
import type { Difficulty, SizeId } from '../engine/difficulty'
import type { Axis, CellState, LineRef } from '../engine/grid'
import type { LineTier } from '../engine/propagate'

export type GameStatus = 'playing' | 'paused' | 'lost' | 'completed' | 'abandoned'

export type GameMode = 'collection' | 'quick'

export const TOOLS = ['fill', 'cross'] as const

export type Tool = (typeof TOOLS)[number]

export type Move = {
  readonly cell: number
  readonly before: CellState
  readonly after: CellState
  readonly batch: number
}

export type Stroke = {
  readonly origin: number
  readonly from: CellState
  readonly to: CellState
  readonly axis: Axis | null
  readonly batch: number
  readonly visited: readonly number[]
}

export type HintInfo =
  | { readonly kind: 'errors'; readonly cells: readonly number[] }
  | {
      readonly kind: 'line'
      readonly line: LineRef
      readonly cells: readonly number[]
      readonly tier: LineTier
    }
  | { readonly kind: 'reveal'; readonly cell: number }
  | { readonly kind: 'exhausted' }

export type GameState = {
  readonly gameId: string
  readonly puzzleId: string
  readonly mode: GameMode
  readonly name: string | null
  readonly sizeId: SizeId
  readonly difficulty: Difficulty
  readonly solution: Solution
  readonly clues: Clues
  readonly cells: readonly CellState[]
  readonly errorCells: readonly number[]
  readonly hintedCells: readonly number[]
  readonly tool: Tool
  readonly activeStroke: Stroke | null
  readonly focusedCell: number | null
  readonly mistakes: number
  readonly countedMistakes: readonly number[]
  readonly hintsUsed: number
  readonly hintsRemaining: number
  readonly elapsedMs: number
  readonly runningSince: number | null
  readonly status: GameStatus
  readonly startedAt: number
  readonly lastPlayedAt: number
  readonly history: readonly Move[]
  readonly redoStack: readonly Move[]
  readonly restartCount: number
  readonly lastHint: HintInfo | null
}

export type GameSettings = {
  readonly autoValidate: boolean
  readonly autoCross: boolean
}

export type GameContext = {
  readonly now: number
  readonly settings: GameSettings
}

export type GameAction =
  | { readonly type: 'setTool'; readonly tool: Tool }
  | { readonly type: 'beginStroke'; readonly cell: number }
  | { readonly type: 'extendStroke'; readonly cells: readonly number[] }
  | { readonly type: 'endStroke' }
  | { readonly type: 'undo' }
  | { readonly type: 'redo' }
  | { readonly type: 'hint'; readonly isRewarded?: boolean }
  | { readonly type: 'dismissHint' }
  | { readonly type: 'pause' }
  | { readonly type: 'resume' }
  | { readonly type: 'tick' }
  | { readonly type: 'restart' }
  | { readonly type: 'retry' }
  | { readonly type: 'continue' }
  | { readonly type: 'abandon' }
