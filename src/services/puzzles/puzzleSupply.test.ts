import type { Difficulty, SizeId } from '@core/engine/difficulty'
import { GENERATOR_VERSION } from '@core/engine/versions'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryStorage } from '../storage/memoryStorage'
import { createPersistence } from '../storage/persistence'
import { QUICK_PACK } from './fallbackPack'
import { createInlineGenerator } from './inlineGenerator'
import { BUFFER_SIZE_PER_KIND, isKind } from './quickBuffer'
import type { PuzzleGenerator } from './PuzzleGenerator'
import { createPuzzleSupply } from './puzzleSupply'

const sequentialSeeds = (): (() => number) => {
  let seed = 1
  return () => seed++
}

const fastGenerator = (): PuzzleGenerator => {
  const inline = createInlineGenerator()
  return {
    generate: (sizeId: SizeId, difficulty: Difficulty, seed: number) =>
      difficulty === 'expert' ? Promise.resolve(null) : inline.generate(sizeId, difficulty, seed),
  }
}

describe('puzzle supply', () => {
  it('falls back to the bundled quick pack when the buffer is empty', async () => {
    const generator: PuzzleGenerator = { generate: vi.fn(async () => null) }
    const supply = createPuzzleSupply({
      generator,
      persistence: createPersistence(createMemoryStorage()),
      randomSeed: sequentialSeeds(),
    })
    const puzzle = await supply.take('10x10', 'expert')
    expect(puzzle).toMatchObject({ sizeId: '10x10', difficulty: 'expert' })
    expect(puzzle.solution).toMatch(/^[#.]{100}$/)
    expect(puzzle.id).toMatch(/^quick-\d+-v\d+$/)
  })

  it('refills the buffer and serves buffered puzzles first', async () => {
    const persistence = createPersistence(createMemoryStorage())
    const supply = createPuzzleSupply({
      generator: fastGenerator(),
      persistence,
      randomSeed: sequentialSeeds(),
    })
    await supply.refill()
    const buffer = await persistence.loadQuickBuffer()
    expect(buffer.puzzles.filter(isKind('5x5', 'easy'))).toHaveLength(BUFFER_SIZE_PER_KIND)
    expect(buffer.puzzles.filter(isKind('10x10', 'expert'))).toHaveLength(0)

    const first = buffer.puzzles.find(isKind('5x5', 'easy'))
    const taken = await supply.take('5x5', 'easy')
    expect(taken.id).toBe(first?.id)
    const after = await persistence.loadQuickBuffer()
    expect(after.recentIds).toEqual([taken.id])
  })

  it('does not run concurrent refills', async () => {
    const generate = vi.fn(async () => null)
    const supply = createPuzzleSupply({
      generator: { generate },
      persistence: createPersistence(createMemoryStorage()),
      randomSeed: sequentialSeeds(),
    })
    const first = supply.refill()
    const second = supply.refill()
    expect(first).toBe(second)
    await first
  })
})

describe('quick pack', () => {
  it('matches the current generator version', () => {
    expect(QUICK_PACK.generatorVersion).toBe(GENERATOR_VERSION)
  })
})
