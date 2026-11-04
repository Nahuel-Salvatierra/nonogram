import { createTestServices, type TestServices } from '@services/createTestServices'
import { afterEach, describe, expect, it } from 'vitest'
import { TEST_QUICK_PUZZLE, TEST_WRONG_CELLS } from '../../test/fixtures'
import { createAppRuntime, type AppRuntime } from './createAppRuntime'

const runtimes: AppRuntime[] = []

afterEach(() => {
  runtimes.splice(0).forEach((runtime) => runtime.dispose())
})

const startOutOfHints = async (services: TestServices): Promise<AppRuntime> => {
  const runtime = createAppRuntime(services)
  runtimes.push(runtime)
  await runtime.start()
  await runtime.gameStore.getState().startQuickGame('5x5', 'easy')
  const store = runtime.gameStore.getState()
  for (let i = 0; i < 4; i++) store.requestHint()
  return runtime
}

const loseGame = async (services: TestServices): Promise<AppRuntime> => {
  const runtime = createAppRuntime(services)
  runtimes.push(runtime)
  await runtime.start()
  await runtime.gameStore.getState().startQuickGame('5x5', 'easy')
  TEST_WRONG_CELLS.forEach((cell) => {
    runtime.gameStore.getState().dispatch({ type: 'beginStroke', cell })
    runtime.gameStore.getState().dispatch({ type: 'endStroke' })
  })
  return runtime
}

describe('rewarded ads', () => {
  it('grants an extra hint for a watched ad without spending the daily budget', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await startOutOfHints(services)
    expect(runtime.gameStore.getState().game?.lastHint).toEqual({ kind: 'exhausted' })

    services.ads.setRewardedResult('rewarded')
    expect(await runtime.rewardedAds.watchForHint()).toBe('rewarded')
    expect(services.ads.rewardedRequests).toEqual(['extraHint'])
    expect(runtime.gameStore.getState().game).toMatchObject({ hintsUsed: 4, hintsRemaining: 0 })
    expect((await services.persistence.loadMeta())?.freeHintsUsed).toBe(3)
  })

  it('does not grant the hint when the ad is closed or fails', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await startOutOfHints(services)

    services.ads.setRewardedResult('dismissed')
    expect(await runtime.rewardedAds.watchForHint()).toBe('dismissed')
    services.ads.setRewardedResult('failed')
    expect(await runtime.rewardedAds.watchForHint()).toBe('failed')
    expect(runtime.gameStore.getState().game?.hintsUsed).toBe(3)
  })

  it('resumes a game paused by the ad before applying the hint', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await startOutOfHints(services)
    services.lifecycle.setActive(false)
    expect(runtime.gameStore.getState().game?.status).toBe('paused')

    services.ads.setRewardedResult('rewarded')
    await runtime.rewardedAds.watchForHint()
    expect(runtime.gameStore.getState().game).toMatchObject({ status: 'playing', hintsUsed: 4 })
  })

  it('continues a lost game with the same board after a watched ad', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await loseGame(services)
    const lost = runtime.gameStore.getState().game
    expect(lost?.status).toBe('lost')

    services.ads.setRewardedResult('rewarded')
    expect(await runtime.rewardedAds.watchToContinue()).toBe('rewarded')
    expect(services.ads.rewardedRequests).toEqual(['continueAfterLoss'])
    expect(runtime.gameStore.getState().game).toMatchObject({
      status: 'playing',
      mistakes: 2,
      cells: lost?.cells,
    })
    expect(services.analytics.events.map((event) => event.name)).toContain('game_continued')
  })

  it('keeps the game lost when the continue ad is not completed', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const runtime = await loseGame(services)

    services.ads.setRewardedResult('dismissed')
    expect(await runtime.rewardedAds.watchToContinue()).toBe('dismissed')
    expect(runtime.gameStore.getState().game?.status).toBe('lost')
  })
})
