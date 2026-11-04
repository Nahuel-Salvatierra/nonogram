import {
  DIFFICULTIES_BY_SIZE,
  SIZE_IDS,
  type Difficulty,
  type SizeId,
} from '@core/engine/difficulty'
import { GENERATOR_VERSION } from '@core/engine/versions'
import type { Persistence } from '../storage/persistence'
import { pickFallbackPuzzle } from './fallbackPack'
import { BUFFER_SIZE_PER_KIND, isKind, RECENT_IDS_LIMIT, type QuickBuffer } from './quickBuffer'
import type { PuzzleGenerator } from './PuzzleGenerator'
import type { QuickPuzzle } from './quickPuzzle'

export interface PuzzleSupply {
  take(sizeId: SizeId, difficulty: Difficulty): Promise<QuickPuzzle>
  refill(): Promise<void>
}

type PuzzleSupplyDeps = {
  readonly generator: PuzzleGenerator
  readonly persistence: Persistence
  readonly randomSeed: () => number
}

const MAX_GENERATION_TRIES = 3

const isCurrent = (puzzle: QuickPuzzle): boolean => puzzle.generatorVersion === GENERATOR_VERSION

const KINDS = SIZE_IDS.flatMap((sizeId) =>
  DIFFICULTIES_BY_SIZE[sizeId].map((difficulty) => ({ sizeId, difficulty })),
)

export const createPuzzleSupply = ({
  generator,
  persistence,
  randomSeed,
}: PuzzleSupplyDeps): PuzzleSupply => {
  let bufferPromise: Promise<QuickBuffer> | null = null
  let refillPromise: Promise<void> | null = null

  const getBuffer = (): Promise<QuickBuffer> => {
    bufferPromise ??= persistence.loadQuickBuffer()
    return bufferPromise
  }

  const setBuffer = async (buffer: QuickBuffer): Promise<void> => {
    bufferPromise = Promise.resolve(buffer)
    await persistence.saveQuickBuffer(buffer)
  }

  const isKnown = (buffer: QuickBuffer, puzzle: QuickPuzzle): boolean =>
    buffer.recentIds.includes(puzzle.id) || buffer.puzzles.some((item) => item.id === puzzle.id)

  const fillKind = async (sizeId: SizeId, difficulty: Difficulty): Promise<void> => {
    for (let tries = 0; tries < BUFFER_SIZE_PER_KIND + MAX_GENERATION_TRIES; tries++) {
      const buffer = await getBuffer()
      const current = buffer.puzzles.filter(isCurrent).filter(isKind(sizeId, difficulty))
      if (current.length >= BUFFER_SIZE_PER_KIND) return
      const generated = await generator.generate(sizeId, difficulty, randomSeed())
      const latest = await getBuffer()
      if (!generated || isKnown(latest, generated)) continue
      await setBuffer({ ...latest, puzzles: [...latest.puzzles.filter(isCurrent), generated] })
    }
  }

  const refill = (): Promise<void> => {
    refillPromise ??= (async () => {
      for (const { sizeId, difficulty } of KINDS) await fillKind(sizeId, difficulty)
    })().finally(() => {
      refillPromise = null
    })
    return refillPromise
  }

  const take = async (sizeId: SizeId, difficulty: Difficulty): Promise<QuickPuzzle> => {
    const buffer = await getBuffer()
    const buffered = buffer.puzzles.filter(isCurrent).find(isKind(sizeId, difficulty))
    const puzzle = buffered ?? pickFallbackPuzzle(sizeId, difficulty, randomSeed())
    await setBuffer({
      puzzles: buffer.puzzles.filter((item) => item !== buffered),
      recentIds: [...buffer.recentIds, puzzle.id].slice(-RECENT_IDS_LIMIT),
    })
    void refill()
    return puzzle
  }

  return { take, refill }
}
