import { COLLECTION } from '@services/puzzles/collection'
import { describe, expect, it } from 'vitest'
import { buildPackViews, sizeProgress } from './selectors'

const [first, second] = COLLECTION[0].puzzles

describe('collection selectors', () => {
  it('derives card status, progress and best time', () => {
    const packs = buildPackViews(
      '5x5',
      {
        [first.id]: { status: 'completed', bestTimeMs: 30_000, completedAt: 1 },
        [second.id]: { status: 'inProgress', bestTimeMs: null, completedAt: null },
      },
      { [second.id]: 0.5 },
    )
    const [card1, card2, card3] = packs[0].puzzles
    expect(card1).toMatchObject({ status: 'completed', bestTimeMs: 30_000 })
    expect(card2).toMatchObject({ status: 'inProgress', progress: 0.5 })
    expect(card3).toMatchObject({ status: 'new', progress: 0 })
    expect(packs[0].completed).toBe(1)
    expect(packs.every((pack) => pack.puzzles.every((card) => card.size.rows === 5))).toBe(true)
  })

  it('counts completed puzzles by size', () => {
    const progress = sizeProgress('5x5', {
      [first.id]: { status: 'completed', bestTimeMs: 1, completedAt: 1 },
    })
    expect(progress.completed).toBe(1)
    expect(progress.total).toBe(
      COLLECTION.filter((pack) => pack.sizeId === '5x5').reduce(
        (n, pack) => n + pack.puzzles.length,
        0,
      ),
    )
  })
})
