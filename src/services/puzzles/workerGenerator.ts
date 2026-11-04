import type { GenerateRequest, GenerateResponse, PuzzleGenerator } from './PuzzleGenerator'
import type { QuickPuzzle } from './quickPuzzle'

export const createWorkerGenerator = (): PuzzleGenerator => {
  let worker: Worker | null = null
  let nextId = 1
  const pending = new Map<number, (puzzle: QuickPuzzle | null) => void>()

  const getWorker = (): Worker => {
    if (worker) return worker
    worker = new Worker(new URL('./generator.worker.ts', import.meta.url), { type: 'module' })
    worker.addEventListener('message', (event: MessageEvent<GenerateResponse>) => {
      pending.get(event.data.id)?.(event.data.puzzle)
      pending.delete(event.data.id)
    })
    worker.addEventListener('error', () => {
      for (const resolve of pending.values()) resolve(null)
      pending.clear()
      worker?.terminate()
      worker = null
    })
    return worker
  }

  return {
    generate: (sizeId, difficulty, seed) =>
      new Promise((resolve) => {
        const request: GenerateRequest = { id: nextId++, sizeId, difficulty, seed }
        pending.set(request.id, resolve)
        getWorker().postMessage(request)
      }),
  }
}
