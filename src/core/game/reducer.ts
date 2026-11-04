import { assertNever } from '../assertNever'
import type { GameResult } from './events'
import { redo, undo } from './history'
import { dismissHint, requestHint } from './hints'
import { abandon, continueAfterLoss, pause, restart, resume, retry, tick } from './lifecycle'
import { beginStroke, endStroke, extendStroke, setTool } from './strokes'
import type { GameAction, GameContext, GameState } from './types'

const route = (state: GameState, action: GameAction, context: GameContext): GameResult => {
  switch (action.type) {
    case 'setTool':
      return setTool(state, action.tool)
    case 'beginStroke':
      return beginStroke(state, action.cell, context)
    case 'extendStroke':
      return extendStroke(state, action.cells, context)
    case 'endStroke':
      return endStroke(state, context)
    case 'undo':
      return undo(state)
    case 'redo':
      return redo(state, context)
    case 'hint':
      return requestHint(state, context, action.isRewarded)
    case 'dismissHint':
      return dismissHint(state)
    case 'pause':
      return pause(state, context)
    case 'resume':
      return resume(state, context)
    case 'tick':
      return tick(state, context)
    case 'restart':
      return restart(state)
    case 'retry':
      return retry(state, context)
    case 'continue':
      return continueAfterLoss(state, context)
    case 'abandon':
      return abandon(state, context)
    default:
      return assertNever(action)
  }
}

export const gameReducer = (
  state: GameState,
  action: GameAction,
  context: GameContext,
): GameResult => {
  const result = route(state, action, context)
  if (result.state === state) return result
  return { ...result, state: { ...result.state, lastPlayedAt: context.now } }
}
