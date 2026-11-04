import { ratePuzzle } from '../src/core/engine/analyzer'
import { deriveClues } from '../src/core/engine/clues'
import { DIFFICULTIES_BY_SIZE, SIZE_IDS, SIZE_OF } from '../src/core/engine/difficulty'
import { generatePuzzle } from '../src/core/engine/generator'
import { createRng } from '../src/core/engine/rng'

const SAMPLES = Number(process.argv[2] ?? 10)

const average = (values: readonly number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

for (const sizeId of SIZE_IDS) {
  const size = SIZE_OF[sizeId]
  for (const difficulty of DIFFICULTIES_BY_SIZE[sizeId]) {
    const rng = createRng(`benchmark-${sizeId}-${difficulty}`)
    const times: number[] = []
    const rounds: number[] = []
    const firstPass: number[] = []
    const density: number[] = []
    let failures = 0
    for (let i = 0; i < SAMPLES; i++) {
      const start = performance.now()
      const puzzle = generatePuzzle(rng, size, difficulty)
      times.push(performance.now() - start)
      if (!puzzle) {
        failures++
        continue
      }
      const rating = ratePuzzle(size, deriveClues(size, puzzle.solution))
      rounds.push(rating.rounds)
      firstPass.push(rating.firstPassRatio)
      density.push(rating.density)
    }
    console.log(
      [
        `${sizeId.padEnd(5)} ${difficulty.padEnd(6)}`,
        `avg ${average(times).toFixed(0)}ms`,
        `max ${Math.max(...times).toFixed(0)}ms`,
        `fail ${failures}/${SAMPLES}`,
        `rounds ${average(rounds).toFixed(1)}`,
        `firstPass ${(average(firstPass) * 100).toFixed(0)}%`,
        `density ${(average(density) * 100).toFixed(0)}%`,
      ].join('  '),
    )
  }
}
