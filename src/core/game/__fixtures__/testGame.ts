import { decodeSolution, parseLine } from '../../engine/text'
import { createGame } from '../createGame'
import { gameReducer } from '../reducer'
import type { GameAction, GameContext, GameSettings, GameState } from '../types'

export const PLAN_SOLUTION = ['.###.', '.#.#.', '#####', '..#..', '..##.'].join('')

export const DEFAULT_TEST_SETTINGS: GameSettings = { autoValidate: true, autoCross: false }

export const testContext = (now = 2_000, settings: Partial<GameSettings> = {}): GameContext => ({
  now,
  settings: { ...DEFAULT_TEST_SETTINGS, ...settings },
})

export const createTestGame = (
  overrides: Partial<GameState> & { board?: string } = {},
): GameState => {
  const { board, ...rest } = overrides
  const { state } = createGame({
    gameId: 'game-1',
    puzzleId: 'tutorial/plan',
    mode: 'collection',
    name: 'Plan',
    sizeId: '5x5',
    difficulty: 'easy',
    solution: decodeSolution(PLAN_SOLUTION),
    now: 1_000,
  })
  const cells = board === undefined ? state.cells : parseLine(board.padEnd(25, '.'))
  return { ...state, cells, ...rest }
}

export const run = (
  state: GameState,
  actions: readonly GameAction[],
  context: GameContext = testContext(),
): GameState =>
  actions.reduce((current, action) => gameReducer(current, action, context).state, state)

export const tap = (cell: number): GameAction[] => [
  { type: 'beginStroke', cell },
  { type: 'endStroke' },
]
