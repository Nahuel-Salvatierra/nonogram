import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ratePuzzle } from '../src/core/engine/analyzer'
import { deriveClues, type Solution } from '../src/core/engine/clues'
import {
  isDifficultyAvailable,
  sizeIdOf,
  type Difficulty,
  type SizeId,
} from '../src/core/engine/difficulty'
import type { Size } from '../src/core/engine/grid'
import { parsePackText, type PackTextPuzzle } from '../src/core/engine/packText'
import { countSolutions } from '../src/core/engine/search'
import { formatPattern, parsePattern } from '../src/core/engine/text'
import { ANALYZER_VERSION } from '../src/core/engine/versions'

const PACKS_DIR = fileURLToPath(new URL('../content/packs/', import.meta.url))
const OUTPUT = fileURLToPath(new URL('../src/services/puzzles/packs.json', import.meta.url))

const isValid = (size: Size, solution: Solution): boolean => {
  const clues = deriveClues(size, solution)
  return ratePuzzle(size, clues).isSolvable && countSolutions(size, clues) === 1
}

const markCells = (size: Size, solution: Solution, cells: readonly number[], mark: string) =>
  formatPattern(size, solution).map((row, r) =>
    [...row].map((char, c) => (cells.includes(r * size.cols + c) ? mark : char)).join(''),
  )

const flip = (solution: Solution, cells: readonly number[]): boolean[] =>
  solution.map((value, i) => (cells.includes(i) ? !value : value))

const suggestFixes = (
  size: Size,
  solution: Solution,
  unresolved: readonly number[],
): string[][] => {
  const candidates = unresolved.slice(0, 40)
  const singles = candidates
    .filter((cell) => isValid(size, flip(solution, [cell])))
    .slice(0, 3)
    .map((cell) => formatPattern(size, flip(solution, [cell])))
  if (singles.length > 0) return singles
  for (let a = 0; a < candidates.length; a++) {
    for (let b = a + 1; b < candidates.length; b++) {
      const fixed = flip(solution, [candidates[a], candidates[b]])
      if (isValid(size, fixed)) return [formatPattern(size, fixed)]
    }
  }
  return []
}

type BuiltPuzzle = PackTextPuzzle & { readonly difficulty: Difficulty; readonly score: number }

const errors: string[] = []
const report = (message: string, grids: readonly (readonly string[])[] = []): undefined => {
  errors.push(
    [message, ...grids.map((grid) => grid.map((row) => `    ${row}`).join('\n'))].join('\n'),
  )
  return undefined
}

const buildPuzzle = (
  packId: string,
  puzzle: PackTextPuzzle,
  sizeId: SizeId | null,
): BuiltPuzzle | undefined => {
  const id = `${packId}/${puzzle.slug}`
  const pattern = parsePattern(puzzle.rows)
  if (!pattern) return report(`${id}: rows must be equal-length lines of # and .`)
  if (sizeIdOf(pattern.size) !== sizeId) return report(`${id}: size differs from the pack size`)
  const clues = deriveClues(pattern.size, pattern.solution)
  const rating = ratePuzzle(pattern.size, clues)
  const solutions = countSolutions(pattern.size, clues)
  if (!rating.isSolvable || solutions !== 1 || rating.difficulty === null) {
    const marked = markCells(pattern.size, pattern.solution, rating.unresolved, '?')
    const fixes = suggestFixes(pattern.size, pattern.solution, rating.unresolved)
    return report(
      `${id}: ${solutions > 1 ? 'ambiguous' : 'not solvable by deduction'} (? = undetermined)` +
        (fixes.length > 0 ? `, suggested fixes below` : ''),
      [marked, ...fixes],
    )
  }
  if (sizeId && !isDifficultyAvailable(sizeId, rating.difficulty)) {
    return report(`${id}: rated ${rating.difficulty}, not allowed for ${sizeId}`)
  }
  return { ...puzzle, difficulty: rating.difficulty, score: rating.score }
}

const packs = readdirSync(PACKS_DIR)
  .filter((file) => file.endsWith('.txt'))
  .sort()
  .flatMap((file) => {
    const parsed = parsePackText(readFileSync(`${PACKS_DIR}${file}`, 'utf8'))
    if (!parsed.ok) {
      report(`${file}: ${parsed.error}`)
      return []
    }
    const { id, title, puzzles } = parsed.pack
    const first = parsePattern(puzzles[0]?.rows ?? [])
    const sizeId = first ? sizeIdOf(first.size) : null
    if (sizeId === null) report(`${id}: unsupported puzzle size`)
    const built = puzzles
      .map((puzzle) => buildPuzzle(id, puzzle, sizeId))
      .filter((puzzle): puzzle is BuiltPuzzle => puzzle !== undefined)
      .sort((a, b) => a.score - b.score)
    return [{ id, title, sizeId, puzzles: built }]
  })

if (errors.length > 0) {
  console.error(errors.join('\n\n'))
  console.error(`\n${errors.length} problem(s); packs.json not written.`)
  process.exit(1)
}

writeFileSync(OUTPUT, `${JSON.stringify({ analyzerVersion: ANALYZER_VERSION, packs }, null, 1)}\n`)
const counts = packs.map((pack) => `${pack.id} ${pack.sizeId} ${pack.puzzles.length}`)
console.log(`Wrote ${OUTPUT}\n${counts.join('\n')}`)
