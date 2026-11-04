import { describe, expect, it } from 'vitest'
import { createMockAdStore } from './mockAdStore'

describe('mock ad store', () => {
  it('shows the requested placement until the player resolves it', async () => {
    const store = createMockAdStore()
    const shown = store.getState().present('extraHint')
    expect(store.getState().placement).toBe('extraHint')

    store.getState().resolve('rewarded')
    expect(await shown).toBe('rewarded')
    expect(store.getState().placement).toBeNull()
  })

  it('dismisses a pending ad when a new one is requested', async () => {
    const store = createMockAdStore()
    const first = store.getState().present('extraHint')
    const second = store.getState().present('continueAfterLoss')

    expect(await first).toBe('dismissed')
    expect(store.getState().placement).toBe('continueAfterLoss')
    store.getState().resolve('dismissed')
    expect(await second).toBe('dismissed')
  })
})
