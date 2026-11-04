import type { GenerateRequest, GenerateResponse } from './PuzzleGenerator'
import { generateQuickPuzzle } from './quickPuzzle'

self.addEventListener('message', (event: MessageEvent<GenerateRequest>) => {
  const { id, sizeId, difficulty, seed } = event.data
  const response: GenerateResponse = { id, puzzle: generateQuickPuzzle(sizeId, difficulty, seed) }
  self.postMessage(response)
})
