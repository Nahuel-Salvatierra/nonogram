import { deriveClues, type Solution } from '../engine/clues'
import { SIZE_OF, type Difficulty, type SizeId } from '../engine/difficulty'
import { emptyCells } from '../engine/grid'
import type { GameResult } from './events'
import type { GameMode } from './types'

export const HINTS_PER_GAME = 3

export const MAX_MISTAKES = 3

export type NewGameParams = {
  readonly gameId: string
  readonly puzzleId: string
  readonly mode: GameMode
  readonly name: string | null
  readonly sizeId: SizeId
  readonly difficulty: Difficulty
  readonly solution: Solution
  readonly now: number
  readonly hintsPerGame?: number
}

export const createGame = (params: NewGameParams): GameResult => {
  const size = SIZE_OF[params.sizeId]
  return {
    state: {
      gameId: params.gameId,
      puzzleId: params.puzzleId,
      mode: params.mode,
      name: params.name,
      sizeId: params.sizeId,
      difficulty: params.difficulty,
      solution: params.solution,
      clues: deriveClues(size, params.solution),
      cells: emptyCells(size),
      errorCells: [],
      hintedCells: [],
      tool: 'fill',
      activeStroke: null,
      focusedCell: null,
      mistakes: 0,
      countedMistakes: [],
      hintsUsed: 0,
      hintsRemaining: params.hintsPerGame ?? HINTS_PER_GAME,
      elapsedMs: 0,
      runningSince: params.now,
      status: 'playing',
      startedAt: params.now,
      lastPlayedAt: params.now,
      history: [],
      redoStack: [],
      restartCount: 0,
      lastHint: null,
    },
    events: [
      {
        type: 'gameStarted',
        gameId: params.gameId,
        puzzleId: params.puzzleId,
        mode: params.mode,
        sizeId: params.sizeId,
        difficulty: params.difficulty,
      },
    ],
  }
}
