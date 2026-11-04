import { describe, expect, it } from 'vitest'
import { createTestGame, run, tap, testContext } from './__fixtures__/testGame'
import { gameReducer } from './reducer'

describe('lifecycle', () => {
  it('pauses and resumes the timer', () => {
    const paused = run(createTestGame(), [{ type: 'pause' }], testContext(3_000))
    expect(paused).toMatchObject({ status: 'paused', elapsedMs: 2_000, runningSince: null })
    const resumed = run(paused, [{ type: 'resume' }], testContext(10_000))
    expect(resumed).toMatchObject({ status: 'playing', runningSince: 10_000 })
  })

  it('cancels an active stroke when pausing', () => {
    const stroking = run(createTestGame(), [{ type: 'beginStroke', cell: 1 }])
    expect(run(stroking, [{ type: 'pause' }]).activeStroke).toBeNull()
  })

  it('syncs elapsed time on tick', () => {
    const ticked = run(createTestGame(), [{ type: 'tick' }], testContext(6_000))
    expect(ticked).toMatchObject({ elapsedMs: 5_000, runningSince: 6_000 })
  })

  it('restarts the board keeping time, mistakes and hints', () => {
    const played = run(createTestGame(), [...tap(0), { type: 'hint' }, ...tap(1)])
    const restarted = run(played, [{ type: 'restart' }])
    expect(restarted.cells.filter((cell) => cell !== 'unknown')).toHaveLength(
      played.hintedCells.length,
    )
    expect(restarted).toMatchObject({ mistakes: 1, hintsUsed: 1, history: [], errorCells: [] })
    expect(restarted.restartCount).toBe(1)
  })

  it('retries a lost game from scratch without refunding spent hints', () => {
    const hinted = createTestGame({
      board: '..#',
      hintedCells: [2],
      hintsUsed: 1,
      hintsRemaining: 2,
    })
    const lost = run(hinted, [...tap(1), ...tap(0), ...tap(4), ...tap(5)])
    expect(lost.status).toBe('lost')
    const { state, events } = gameReducer(lost, { type: 'retry' }, testContext(8_000))
    expect(state).toMatchObject({
      status: 'playing',
      mistakes: 0,
      countedMistakes: [],
      errorCells: [],
      hintedCells: [],
      hintsUsed: 0,
      hintsRemaining: 2,
      elapsedMs: 0,
      runningSince: 8_000,
      history: [],
      restartCount: 1,
    })
    expect(state.cells.every((cell) => cell === 'unknown')).toBe(true)
    expect(events).toEqual([{ type: 'gameRestarted', gameId: 'game-1' }])
  })

  it('continues a lost game keeping the board, hints and time with one mistake left', () => {
    const lost = run(
      createTestGame({ hintedCells: [2], hintsUsed: 1 }),
      [...tap(0), ...tap(4), ...tap(5)],
      testContext(5_000),
    )
    const { state, events } = gameReducer(lost, { type: 'continue' }, testContext(9_000))
    expect(state).toMatchObject({
      status: 'playing',
      mistakes: 2,
      cells: lost.cells,
      hintedCells: [2],
      hintsUsed: 1,
      elapsedMs: lost.elapsedMs,
      runningSince: 9_000,
      countedMistakes: lost.countedMistakes,
    })
    expect(events).toEqual([{ type: 'gameContinued', gameId: 'game-1' }])
    expect(run(state, tap(9)).status).toBe('lost')
  })

  it('only continues lost games', () => {
    const playing = createTestGame()
    expect(gameReducer(playing, { type: 'continue' }, testContext()).state).toBe(playing)
  })

  it('only retries lost games and only restarts active ones', () => {
    const playing = createTestGame()
    expect(gameReducer(playing, { type: 'retry' }, testContext()).state).toBe(playing)
    const lost = run(createTestGame(), [...tap(0), ...tap(4), ...tap(5)])
    expect(gameReducer(lost, { type: 'restart' }, testContext()).state).toBe(lost)
  })

  it('abandons a lost game', () => {
    const lost = run(createTestGame(), [...tap(0), ...tap(4), ...tap(5)])
    expect(run(lost, [{ type: 'abandon' }]).status).toBe('abandoned')
  })

  it('abandons with a summary and progress', () => {
    const { state, events } = gameReducer(
      run(createTestGame(), tap(1)),
      { type: 'abandon' },
      testContext(4_000),
    )
    expect(state.status).toBe('abandoned')
    expect(events[0]).toMatchObject({ type: 'gameAbandoned', progress: 1 / 13 })
  })

  it('stamps lastPlayedAt only when the state changes', () => {
    const state = createTestGame()
    expect(gameReducer(state, { type: 'resume' }, testContext(9_000)).state).toBe(state)
    expect(run(state, tap(1), testContext(9_000)).lastPlayedAt).toBe(9_000)
  })
})
