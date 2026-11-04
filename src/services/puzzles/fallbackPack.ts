import { DIFFICULTIES, SIZE_IDS, type Difficulty, type SizeId } from '@core/engine/difficulty'
import { createRng } from '@core/engine/rng'
import { z } from 'zod'
import quickPackJson from './quickPack.json'
import type { QuickPuzzle } from './quickPuzzle'

const quickPackSchema = z.object({
  generatorVersion: z.number().int(),
  puzzles: z.array(
    z.object({
      seed: z.number().int(),
      sizeId: z.enum(SIZE_IDS),
      difficulty: z.enum(DIFFICULTIES),
      solution: z.string(),
      score: z.number(),
    }),
  ),
})

export const QUICK_PACK = quickPackSchema.parse(quickPackJson)

export const pickFallbackPuzzle = (
  sizeId: SizeId,
  difficulty: Difficulty,
  seed: number,
): QuickPuzzle => {
  const entries = QUICK_PACK.puzzles.filter(
    (entry) => entry.sizeId === sizeId && entry.difficulty === difficulty,
  )
  const entry = entries[createRng(seed).int(entries.length)]
  return {
    id: `quick-${entry.seed}-v${QUICK_PACK.generatorVersion}`,
    sizeId,
    difficulty,
    solution: entry.solution,
    score: entry.score,
    generatorVersion: QUICK_PACK.generatorVersion,
  }
}
