import { expect, test } from '@playwright/test'
import {
  board,
  cell,
  dragCells,
  readSavedGame,
  solveByDragging,
  startQuickGame,
  tapCell,
} from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('dragging paints a whole row and one undo reverts it', async ({ page }) => {
  await startQuickGame(page, '5x5', 'Fácil')
  await page.getByRole('button', { name: 'Marcar' }).click()
  await dragCells(page, 10, 14)
  for (const index of [10, 11, 12, 13, 14]) {
    await expect(cell(page, index)).toHaveAttribute('data-state', 'crossed')
  }
  await expect(cell(page, 5)).toHaveAttribute('data-state', 'unknown')
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.locator('[data-state="crossed"]')).toHaveCount(0)
})

test('zooms the board with the buttons and paints the zoomed cells', async ({ page }) => {
  await startQuickGame(page, '10x10', 'Fácil')
  const before = await cell(page, 55).boundingBox()
  await page.getByRole('button', { name: 'Acercar' }).click()
  await page.getByRole('button', { name: 'Acercar' }).click()
  const after = await cell(page, 55).boundingBox()
  expect(after?.width ?? 0).toBeGreaterThan((before?.width ?? 0) * 1.8)

  await page.getByRole('button', { name: 'Marcar' }).click()
  await tapCell(page, 55)
  await expect(cell(page, 55)).toHaveAttribute('data-state', 'crossed')
  await page.getByRole('button', { name: 'Ajustar tablero' }).click()
  await expect(page.getByRole('button', { name: 'Alejar' })).toBeDisabled()
})

test('loses after three mistakes and retries from scratch', async ({ page }) => {
  await startQuickGame(page, '5x5', 'Fácil')
  const game = await readSavedGame(page)
  const wrong = [...game.solution].flatMap((char, index) => (char === '.' ? [index] : []))
  for (const index of wrong.slice(0, 3)) await tapCell(page, index)

  const dialog = page.getByRole('dialog', { name: 'Perdiste' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Reintentar' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText('Errores: 0/3')).toBeVisible()
})

test('completes a 5x5 quick game and records it in statistics', async ({ page }) => {
  await startQuickGame(page, '5x5', 'Fácil')
  await solveByDragging(page, await readSavedGame(page))

  await expect(page.getByRole('heading', { name: '¡Resuelto!' })).toBeVisible()
  await page.getByRole('button', { name: 'Inicio' }).click()
  await page.getByRole('button', { name: 'Estadísticas' }).click()
  await expect(page.getByText('Completadas').locator('..')).toContainText('1')
})

test('completes a collection puzzle and shows it solved in the collection', async ({ page }) => {
  await page.getByRole('button', { name: /^Colección/ }).click()
  await page.getByRole('button', { name: '?, sin empezar' }).first().click()
  await expect(board(page)).toBeVisible()
  await solveByDragging(page, await readSavedGame(page))

  await expect(page.getByRole('heading', { name: '¡Resuelto!' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Siguiente puzzle' })).toBeVisible()
  await page.getByRole('button', { name: 'Colección', exact: true }).click()
  await expect(page.getByRole('button', { name: /resuelto en/ })).toHaveCount(1)
})

test('restores the game after reloading the app', async ({ page }) => {
  await startQuickGame(page, '10x10', 'Medio')
  const game = await readSavedGame(page)
  const first = game.solution.indexOf('#')
  await tapCell(page, first)
  await expect.poll(async () => (await readSavedGame(page)).cells[first]).toBe('f')

  await page.reload()
  await page
    .getByRole('dialog', { name: 'Pausa' })
    .getByRole('button', { name: 'Reanudar' })
    .click()
  await expect(cell(page, first)).toHaveAttribute('data-state', 'filled')
})

test('abandoning a game returns home and counts it in statistics', async ({ page }) => {
  await startQuickGame(page, '10x10', 'Difícil')
  await page.getByRole('button', { name: 'Pausar' }).click()
  await page
    .getByRole('dialog', { name: 'Pausa' })
    .getByRole('button', { name: 'Abandonar' })
    .click()
  await page
    .getByRole('dialog', { name: '¿Abandonar la partida?' })
    .getByRole('button', { name: 'Abandonar' })
    .click()

  await expect(page.getByRole('button', { name: 'Partida rápida' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Continuar/ })).toBeHidden()
  await page.getByRole('button', { name: 'Estadísticas' }).click()
  await expect(page.getByText('Abandonadas').locator('..')).toContainText('1')
})

test('dark theme setting persists across reloads', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajustes' }).click()
  await page.getByRole('button', { name: 'Oscuro' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
})
