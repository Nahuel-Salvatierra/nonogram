import type { Solution } from '@core/engine/clues'
import type { Difficulty, SizeId } from '@core/engine/difficulty'
import type { Size } from '@core/engine/grid'
import { decodeSolution } from '@core/engine/text'
import { completedCount, type CollectionRecord } from '@core/stats/collection'
import { COLLECTION, TUTORIAL_PACK_ID, type CollectionPack } from '@services/puzzles/collection'
import type { PuzzleProgress } from '../stores/collectionStore'

export type PuzzleCardStatus = 'new' | 'inProgress' | 'completed'

export type PuzzleCardView = {
  readonly id: string
  readonly name: string
  readonly size: Size
  readonly difficulty: Difficulty
  readonly status: PuzzleCardStatus
  readonly progress: number
  readonly bestTimeMs: number | null
  readonly solution: Solution
}

export type PackView = {
  readonly id: string
  readonly title: string
  readonly completed: number
  readonly total: number
  readonly puzzles: readonly PuzzleCardView[]
}

export type SizeProgress = { readonly completed: number; readonly total: number }

const statusOf = (record: CollectionRecord, id: string): PuzzleCardStatus => {
  const status = record[id]?.status
  if (status === 'completed') return 'completed'
  return status === 'inProgress' ? 'inProgress' : 'new'
}

const packView = (
  pack: CollectionPack,
  record: CollectionRecord,
  progress: PuzzleProgress,
): PackView => ({
  id: pack.id,
  title: pack.title,
  completed: completedCount(
    record,
    pack.puzzles.map((puzzle) => puzzle.id),
  ),
  total: pack.puzzles.length,
  puzzles: pack.puzzles.map((puzzle) => ({
    id: puzzle.id,
    name: puzzle.name,
    size: puzzle.size,
    difficulty: puzzle.difficulty,
    status: statusOf(record, puzzle.id),
    progress: progress[puzzle.id] ?? 0,
    bestTimeMs: record[puzzle.id]?.bestTimeMs ?? null,
    solution: decodeSolution(puzzle.solution),
  })),
})

export const buildPackViews = (
  sizeId: SizeId,
  record: CollectionRecord,
  progress: PuzzleProgress,
): PackView[] =>
  COLLECTION.filter((pack) => pack.sizeId === sizeId).map((pack) =>
    packView(pack, record, progress),
  )

export const tutorialIndexOf = (puzzleId: string): number | null => {
  const tutorial = COLLECTION.find((pack) => pack.id === TUTORIAL_PACK_ID)
  const index = tutorial?.puzzles.findIndex((puzzle) => puzzle.id === puzzleId) ?? -1
  return index >= 0 ? index : null
}

export const firstTutorialPuzzleId = (): string | null =>
  COLLECTION.find((pack) => pack.id === TUTORIAL_PACK_ID)?.puzzles[0]?.id ?? null

const progressOf = (packs: readonly CollectionPack[], record: CollectionRecord): SizeProgress => {
  const ids = packs.flatMap((pack) => pack.puzzles.map((puzzle) => puzzle.id))
  return { completed: completedCount(record, ids), total: ids.length }
}

export const sizeProgress = (sizeId: SizeId, record: CollectionRecord): SizeProgress =>
  progressOf(
    COLLECTION.filter((pack) => pack.sizeId === sizeId),
    record,
  )

export const overallProgress = (record: CollectionRecord): SizeProgress =>
  progressOf(COLLECTION, record)
