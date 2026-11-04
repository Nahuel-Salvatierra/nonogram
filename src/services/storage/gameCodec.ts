import { deriveClues } from '@core/engine/clues'
import { SIZE_OF } from '@core/engine/difficulty'
import { cellCount } from '@core/engine/grid'
import { decodeCells, decodeSolution, encodeCells, encodeSolution } from '@core/engine/text'
import type { GameState } from '@core/game/types'
import type { SavedGame } from './schemas'

export const encodeGame = (state: GameState): SavedGame => ({
  gameId: state.gameId,
  puzzleId: state.puzzleId,
  mode: state.mode,
  name: state.name,
  sizeId: state.sizeId,
  difficulty: state.difficulty,
  solution: encodeSolution(state.solution),
  cells: encodeCells(state.cells),
  errorCells: [...state.errorCells],
  hintedCells: [...state.hintedCells],
  tool: state.tool,
  mistakes: state.mistakes,
  countedMistakes: [...state.countedMistakes],
  hintsUsed: state.hintsUsed,
  hintsRemaining: state.hintsRemaining,
  elapsedMs: state.elapsedMs,
  runningSince: state.runningSince,
  status: state.status,
  startedAt: state.startedAt,
  lastPlayedAt: state.lastPlayedAt,
  history: [...state.history],
  redoStack: [...state.redoStack],
  restartCount: state.restartCount,
  lastHint: state.lastHint,
})

export const decodeGame = (saved: SavedGame): GameState | null => {
  const size = SIZE_OF[saved.sizeId]
  const cells = decodeCells(saved.cells)
  const count = cellCount(size)
  if (cells === null || cells.length !== count || saved.solution.length !== count) return null
  const solution = decodeSolution(saved.solution)
  return {
    ...saved,
    solution,
    cells,
    clues: deriveClues(size, solution),
    activeStroke: null,
    focusedCell: null,
  }
}
