import {
  DIFFICULTIES,
  SIZE_IDS,
  SIZE_OF,
  type Difficulty,
  type SizeId,
} from '@core/engine/difficulty'
import type { Size } from '@core/engine/grid'
import { z } from 'zod'
import packsJson from './packs.json'

export type CollectionPuzzle = {
  readonly id: string
  readonly packId: string
  readonly name: string
  readonly sizeId: SizeId
  readonly size: Size
  readonly solution: string
  readonly difficulty: Difficulty
  readonly score: number
}

export type CollectionPack = {
  readonly id: string
  readonly title: string
  readonly sizeId: SizeId
  readonly puzzles: readonly CollectionPuzzle[]
}

const packsFileSchema = z.object({
  analyzerVersion: z.number().int(),
  packs: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      sizeId: z.enum(SIZE_IDS),
      puzzles: z.array(
        z.object({
          slug: z.string(),
          name: z.string(),
          rows: z.array(z.string()),
          difficulty: z.enum(DIFFICULTIES),
          score: z.number(),
        }),
      ),
    }),
  ),
})

const packsFile = packsFileSchema.parse(packsJson)

export const PACKS_ANALYZER_VERSION = packsFile.analyzerVersion

export const COLLECTION: readonly CollectionPack[] = packsFile.packs.map((pack) => ({
  id: pack.id,
  title: pack.title,
  sizeId: pack.sizeId,
  puzzles: pack.puzzles.map((puzzle) => ({
    id: `${pack.id}/${puzzle.slug}`,
    packId: pack.id,
    name: puzzle.name,
    sizeId: pack.sizeId,
    size: SIZE_OF[pack.sizeId],
    solution: puzzle.rows.join(''),
    difficulty: puzzle.difficulty,
    score: puzzle.score,
  })),
}))

const ALL_PUZZLES = COLLECTION.flatMap((pack) => pack.puzzles)

export const findCollectionPuzzle = (id: string): CollectionPuzzle | null =>
  ALL_PUZZLES.find((puzzle) => puzzle.id === id) ?? null

export const nextCollectionPuzzle = (id: string): CollectionPuzzle | null => {
  const current = findCollectionPuzzle(id)
  if (!current) return null
  const sameSize = ALL_PUZZLES.filter((puzzle) => puzzle.sizeId === current.sizeId)
  return sameSize[sameSize.indexOf(current) + 1] ?? null
}

export const TUTORIAL_PACK_ID = 'tutorial'
