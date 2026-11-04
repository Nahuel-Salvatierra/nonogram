import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DIFFICULTIES_BY_SIZE, SIZE_IDS, SIZE_OF } from '../src/core/engine/difficulty'
import { generatePuzzle } from '../src/core/engine/generator'
import { createRng } from '../src/core/engine/rng'
import { encodeSolution } from '../src/core/engine/text'
import { GENERATOR_VERSION } from '../src/core/engine/versions'

const PER_KIND = Number(process.argv[2] ?? 8)
const OUTPUT = fileURLToPath(new URL('../src/services/puzzles/quickPack.json', import.meta.url))

const rng = createRng(`quick-pack-v${GENERATOR_VERSION}`)
const puzzles = SIZE_IDS.flatMap((sizeId) =>
  DIFFICULTIES_BY_SIZE[sizeId].flatMap((difficulty) => {
    const generated = []
    while (generated.length < PER_KIND) {
      const seed = rng.int(2 ** 31)
      const puzzle = generatePuzzle(createRng(seed), SIZE_OF[sizeId], difficulty)
      if (puzzle) {
        generated.push({
          seed,
          sizeId,
          difficulty,
          solution: encodeSolution(puzzle.solution),
          score: puzzle.score,
        })
      }
    }
    console.log(`${sizeId} ${difficulty}: ${generated.length}`)
    return generated
  }),
)

writeFileSync(
  OUTPUT,
  `${JSON.stringify({ generatorVersion: GENERATOR_VERSION, puzzles }, null, 1)}\n`,
)
console.log(`Wrote ${OUTPUT}`)
