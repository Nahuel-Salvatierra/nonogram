import { expect, type Page } from '@playwright/test'

const SAVED_GAMES_KEY = 'CapacitorStorage.games'

export type SavedGame = {
  readonly puzzleId: string
  readonly sizeId: string
  readonly solution: string
  readonly cells: string
}

type SavedDocument = { readonly schemaVersion: number; readonly data: { games: SavedGame[] } }

export const board = (page: Page) => page.getByRole('group', { name: 'Tablero del nonograma' })

export const cell = (page: Page, index: number) => page.locator(`[data-cell="${index}"]`)

export const startQuickGame = async (
  page: Page,
  size: string,
  difficulty: string,
): Promise<void> => {
  await page.getByRole('button', { name: 'Partida rápida' }).click()
  const sheet = page.getByRole('dialog', { name: 'Partida rápida' })
  await sheet.getByRole('button', { name: size, exact: true }).click()
  await sheet.getByRole('button', { name: new RegExp(`^${difficulty}`) }).click()
  await expect(board(page)).toBeVisible({ timeout: 15_000 })
}

export const readSavedGame = async (page: Page): Promise<SavedGame> => {
  const read = () =>
    page.evaluate((key) => {
      const raw = localStorage.getItem(key)
      return raw === null ? null : raw
    }, SAVED_GAMES_KEY)
  await expect.poll(read).not.toBeNull()
  const document: SavedDocument = JSON.parse((await read()) ?? '')
  const [latest] = document.data.games
  return latest
}

const centerOf = async (page: Page, index: number): Promise<{ x: number; y: number }> => {
  const box = await cell(page, index).boundingBox()
  if (!box) throw new Error(`cell ${index} has no box`)
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

export const dragCells = async (page: Page, from: number, to: number): Promise<void> => {
  const start = await centerOf(page, from)
  const end = await centerOf(page, to)
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(end.x, end.y, { steps: 8 })
  await page.mouse.up()
}

export const tapCell = async (page: Page, index: number): Promise<void> => {
  const point = await centerOf(page, index)
  await page.mouse.click(point.x, point.y)
}

export const filledRuns = (solution: string, cols: number): [number, number][] => {
  const runs: [number, number][] = []
  for (let row = 0; row * cols < solution.length; row++) {
    let start = -1
    for (let col = 0; col <= cols; col++) {
      const index = row * cols + col
      const isFilled = col < cols && solution[index] === '#'
      if (isFilled && start < 0) start = index
      if (!isFilled && start >= 0) {
        runs.push([start, index - 1])
        start = -1
      }
    }
  }
  return runs
}

export const solveByDragging = async (page: Page, game: SavedGame): Promise<void> => {
  const cols = Number(game.sizeId.split('x')[1])
  for (const [from, to] of filledRuns(game.solution, cols)) {
    if (from === to) await tapCell(page, from)
    else await dragCells(page, from, to)
  }
}
