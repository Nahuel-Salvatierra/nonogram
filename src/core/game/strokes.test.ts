import { describe, expect, it } from 'vitest'
import { formatLine } from '../engine/text'
import { createTestGame, run, tap, testContext } from './__fixtures__/testGame'
import { gameReducer } from './reducer'

const board = (cells: readonly Parameters<typeof formatLine>[0][number][]): string =>
  formatLine(cells)

describe('tools', () => {
  it('fills an unknown cell and clears it on a second tap', () => {
    const filled = run(createTestGame(), tap(1))
    expect(filled.cells[1]).toBe('filled')
    expect(run(filled, tap(1)).cells[1]).toBe('unknown')
  })

  it('crosses with the cross tool and protects filled cells', () => {
    const crossed = run(createTestGame({ tool: 'cross' }), tap(0))
    expect(crossed.cells[0]).toBe('crossed')
    const withFilled = run(createTestGame({ board: '.#', tool: 'cross' }), tap(1))
    expect(withFilled.cells[1]).toBe('filled')
  })

  it('does not fill a crossed cell with the fill tool', () => {
    const state = createTestGame({ board: 'x' })
    expect(run(state, tap(0)).cells[0]).toBe('crossed')
  })

  it('ignores tool changes during a stroke', () => {
    const state = run(createTestGame(), [{ type: 'beginStroke', cell: 1 }])
    expect(gameReducer(state, { type: 'setTool', tool: 'cross' }, testContext()).state).toBe(state)
  })
})

describe('strokes', () => {
  it('paints the whole segment and locks the axis of the first move', () => {
    const state = run(createTestGame(), [
      { type: 'beginStroke', cell: 10 },
      { type: 'extendStroke', cells: [10, 11, 12] },
      { type: 'extendStroke', cells: [10, 15, 20] },
      { type: 'endStroke' },
    ])
    expect(board(state.cells.slice(10, 15))).toBe('###..')
    expect(state.cells[15]).toBe('unknown')
  })

  it('only paints cells in the state of the first cell', () => {
    const state = run(createTestGame({ board: '.....#.x', tool: 'fill' }), [
      { type: 'beginStroke', cell: 5 },
      { type: 'extendStroke', cells: [5, 6, 7, 8] },
      { type: 'endStroke' },
    ])
    expect(board(state.cells.slice(5, 10))).toBe('..x..')
  })

  it('undoes a whole stroke in one step', () => {
    const painted = run(createTestGame(), [
      { type: 'beginStroke', cell: 1 },
      { type: 'extendStroke', cells: [1, 2, 3] },
      { type: 'endStroke' },
    ])
    const undone = run(painted, [{ type: 'undo' }])
    expect(undone.cells.slice(1, 4)).toEqual(['unknown', 'unknown', 'unknown'])
    const redone = run(undone, [{ type: 'redo' }])
    expect(redone.cells.slice(1, 4)).toEqual(['filled', 'filled', 'filled'])
  })

  it('ignores strokes while paused', () => {
    const paused = createTestGame({ status: 'paused', runningSince: null })
    expect(gameReducer(paused, { type: 'beginStroke', cell: 1 }, testContext()).state).toBe(paused)
  })
})

describe('validation', () => {
  it('auto-corrects a wrong fill to a red cross and counts one mistake per cell', () => {
    const { state, events } = gameReducer(
      createTestGame(),
      { type: 'beginStroke', cell: 0 },
      testContext(),
    )
    expect(state.cells[0]).toBe('crossed')
    expect(state.errorCells).toEqual([0])
    expect(state.mistakes).toBe(1)
    expect(events).toContainEqual({ type: 'mistakeMade', cell: 0 })
    const again = run(createTestGame({ countedMistakes: [0], mistakes: 1 }), tap(0))
    expect(again.mistakes).toBe(1)
  })

  it('keeps wrong fills when auto-validate is off', () => {
    const state = run(createTestGame(), tap(0), testContext(2_000, { autoValidate: false }))
    expect(state.cells[0]).toBe('filled')
    expect(state.mistakes).toBe(0)
  })

  it('does not validate crosses immediately', () => {
    const state = run(createTestGame({ tool: 'cross' }), tap(1))
    expect(state.cells[1]).toBe('crossed')
    expect(state.mistakes).toBe(0)
  })

  it('auto-crosses the rest of completed lines when enabled', () => {
    const context = testContext(2_000, { autoCross: true })
    const state = run(
      createTestGame(),
      [{ type: 'beginStroke', cell: 17 }, { type: 'endStroke' }],
      context,
    )
    expect(board(state.cells.slice(15, 20))).toBe('xx#xx')
    expect(run(state, [{ type: 'undo' }]).cells.slice(15, 20)).toEqual(new Array(5).fill('unknown'))
  })
})

describe('mistake limit', () => {
  it('loses the game on the third mistake and stops the timer', () => {
    const twoMistakes = run(createTestGame(), [...tap(0), ...tap(4)])
    expect(twoMistakes.status).toBe('playing')
    const { state, events } = gameReducer(
      twoMistakes,
      { type: 'beginStroke', cell: 5 },
      testContext(6_000),
    )
    expect(state).toMatchObject({
      status: 'lost',
      mistakes: 3,
      runningSince: null,
      elapsedMs: 5_000,
    })
    expect(events.at(-1)).toMatchObject({ type: 'gameLost', summary: { mistakes: 3 } })
  })

  it('stops painting the rest of the stroke once the limit is reached', () => {
    const state = run(createTestGame(), [
      ...tap(0),
      ...tap(4),
      { type: 'beginStroke', cell: 15 },
      { type: 'extendStroke', cells: [15, 16, 17, 18, 19] },
      { type: 'endStroke' },
    ])
    expect(state.status).toBe('lost')
    expect(state.cells.slice(15, 20)).toEqual([
      'crossed',
      'unknown',
      'unknown',
      'unknown',
      'unknown',
    ])
  })

  it('ignores strokes after losing', () => {
    const lost = run(createTestGame(), [...tap(0), ...tap(4), ...tap(5)])
    expect(gameReducer(lost, { type: 'beginStroke', cell: 1 }, testContext()).state).toBe(lost)
  })

  it('never loses with auto-validate off', () => {
    const context = testContext(2_000, { autoValidate: false })
    const state = run(createTestGame(), [...tap(0), ...tap(4), ...tap(5), ...tap(7)], context)
    expect(state).toMatchObject({ status: 'playing', mistakes: 0 })
  })
})

describe('completion', () => {
  it('completes the game when the filled cells match the solution', () => {
    const solved = createTestGame({ board: '.###..#.#.####...#....##.' })
    const { state, events } = gameReducer(
      solved,
      { type: 'beginStroke', cell: 14 },
      testContext(5_000),
    )
    expect(state.status).toBe('completed')
    expect(state.runningSince).toBeNull()
    expect(state.elapsedMs).toBe(4_000)
    expect(events.at(-1)).toMatchObject({ type: 'gameCompleted', summary: { mistakes: 0 } })
  })
})
