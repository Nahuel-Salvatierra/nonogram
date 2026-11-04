import { describe, expect, it } from 'vitest'
import { createTestGame, run, testContext } from './__fixtures__/testGame'
import { withFreeHints } from './hints'
import { gameReducer } from './reducer'

describe('hint policy', () => {
  it('points at errors first without spending a hint', () => {
    const state = createTestGame({ board: '#x' })
    const next = run(state, [{ type: 'hint' }])
    expect(next.lastHint).toEqual({ kind: 'errors', cells: [0, 1] })
    expect(next.hintsRemaining).toBe(3)
  })

  it('applies the simplest line deduction as locked hinted cells', () => {
    const { state, events } = gameReducer(createTestGame(), { type: 'hint' }, testContext())
    expect(state.lastHint).toMatchObject({ kind: 'line', tier: 1, line: { axis: 'row', index: 2 } })
    expect(state.hintedCells).toEqual([10, 11, 12, 13, 14])
    expect(state.cells.slice(10, 15)).toEqual(new Array(5).fill('filled'))
    expect(state.hintsRemaining).toBe(2)
    expect(events).toContainEqual({
      type: 'hintUsed',
      gameId: 'game-1',
      kind: 'line',
      hintsRemaining: 2,
      isRewarded: false,
    })
  })

  it('protects hinted cells from strokes and undo', () => {
    const hinted = run(createTestGame(), [{ type: 'hint' }])
    const erased = run(hinted, [{ type: 'beginStroke', cell: 10 }, { type: 'endStroke' }])
    expect(erased.cells[10]).toBe('filled')
  })

  it('reports exhaustion when no hints remain', () => {
    const { state, events } = gameReducer(
      createTestGame({ hintsRemaining: 0 }),
      { type: 'hint' },
      testContext(),
    )
    expect(state.lastHint).toEqual({ kind: 'exhausted' })
    expect(events).toEqual([{ type: 'hintsExhausted', gameId: 'game-1' }])
  })

  it('applies a rewarded hint without free hints and without spending one', () => {
    const { state, events } = gameReducer(
      createTestGame({ hintsRemaining: 0 }),
      { type: 'hint', isRewarded: true },
      testContext(),
    )
    expect(state.hintedCells).toEqual([10, 11, 12, 13, 14])
    expect(state).toMatchObject({ hintsUsed: 1, hintsRemaining: 0 })
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'hintUsed', hintsRemaining: 0, isRewarded: true }),
    )
  })

  it('points at errors before spending a rewarded hint', () => {
    const state = run(createTestGame({ board: '#', hintsRemaining: 0 }), [
      { type: 'hint', isRewarded: true },
    ])
    expect(state.lastHint).toEqual({ kind: 'errors', cells: [0] })
    expect(state.hintsUsed).toBe(0)
  })

  it('syncs the visible free hints without changing anything else', () => {
    const state = createTestGame()
    expect(withFreeHints(state, state.hintsRemaining)).toBe(state)
    expect(withFreeHints(state, 1)).toEqual({ ...state, hintsRemaining: 1 })
  })

  it('dismisses the last hint', () => {
    const hinted = run(createTestGame(), [{ type: 'hint' }, { type: 'dismissHint' }])
    expect(hinted.lastHint).toBeNull()
  })

  it('can complete the puzzle', () => {
    const almost = createTestGame({
      board: ['x###x', 'x#x#x', '####.', 'xx#xx', 'xx##x'].join(''),
      hintsRemaining: 1,
    })
    const { state } = gameReducer(almost, { type: 'hint' }, testContext())
    expect(state.status).toBe('completed')
  })
})
