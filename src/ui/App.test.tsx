import { createMockAdStore } from '@app/stores/mockAdStore'
import { createMockAdService } from '@services/ads/AdService'
import { createTestServices, type TestServices } from '@services/createTestServices'
import { COLLECTION } from '@services/puzzles/collection'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TEST_FILLED_CELLS, TEST_QUICK_PUZZLE, TEST_WRONG_CELLS } from '../test/fixtures'
import { renderApp, type RenderedApp } from '../test/renderApp'

const cellAt = (app: RenderedApp, cell: number): HTMLElement => {
  const element = app.container.querySelector<HTMLElement>(`[data-cell="${cell}"]`)
  if (!element) throw new Error(`cell ${cell} not rendered`)
  return element
}

const tap = (app: RenderedApp, cell: number): void => {
  const element = cellAt(app, cell)
  fireEvent.pointerDown(element, { button: 0, pointerId: 1 })
  fireEvent.pointerUp(element, { button: 0, pointerId: 1 })
}

const drag = (app: RenderedApp, from: number, to: number): void => {
  const target = cellAt(app, to)
  fireEvent.pointerDown(cellAt(app, from), { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
  fireEvent.pointerMove(target, { pointerId: 1, clientX: 100, clientY: 0 })
  fireEvent.pointerUp(target, { pointerId: 1 })
}

const startQuickGame = async (): Promise<void> => {
  fireEvent.click(screen.getByRole('button', { name: 'Partida rápida' }))
  const sheet = await screen.findByRole('dialog', { name: 'Partida rápida' })
  fireEvent.click(within(sheet).getByRole('button', { name: '5x5' }))
  fireEvent.click(within(sheet).getByRole('button', { name: /^Fácil/ }))
  await screen.findByRole('group', { name: 'Tablero del nonograma' })
}

const setup = async (services: TestServices = createTestServices(TEST_QUICK_PUZZLE)) => ({
  services,
  app: await renderApp(services),
})

describe('app integration', () => {
  it('plays a full quick game from home to the victory screen', async () => {
    const { app, services } = await setup()
    await startQuickGame()
    services.setNow(91_000)
    TEST_FILLED_CELLS.forEach((cell) => tap(app, cell))

    expect(await screen.findByRole('heading', { name: '¡Resuelto!' })).toBeInTheDocument()
    expect(screen.getByText('Nuevo récord')).toBeInTheDocument()
    expect(screen.getByText('01:30')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Inicio' }))
    expect(await screen.findByRole('button', { name: 'Partida rápida' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Continuar/ })).not.toBeInTheDocument()
  })

  it('paints a whole row with one drag and undoes it in one step', async () => {
    const { app } = await setup()
    await startQuickGame()
    drag(app, 10, 14)
    expect([10, 11, 12, 13, 14].map((cell) => cellAt(app, cell).dataset.state)).toEqual(
      Array(5).fill('filled'),
    )
    expect(app.container.querySelector('[data-clue="row-2"]')).toHaveAttribute('data-done', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(app.container.querySelectorAll('[data-state="filled"]')).toHaveLength(0)
  })

  it('auto-corrects a wrong fill and counts the mistake', async () => {
    const { app } = await setup()
    await startQuickGame()
    tap(app, 0)
    expect(cellAt(app, 0)).toHaveAccessibleName('Fila 1, columna 1, marcada, error')
    expect(screen.getByText('Errores: 1/3')).toBeInTheDocument()
  })

  it('loses after three mistakes and retries the puzzle from scratch', async () => {
    const { app } = await setup()
    await startQuickGame()
    TEST_WRONG_CELLS.forEach((cell) => tap(app, cell))
    const dialog = await screen.findByRole('dialog', { name: 'Perdiste' })

    fireEvent.click(within(dialog).getByRole('button', { name: 'Reintentar' }))
    expect(screen.queryByRole('dialog', { name: 'Perdiste' })).not.toBeInTheDocument()
    expect(screen.getByText('Errores: 0/3')).toBeInTheDocument()
    expect(app.container.querySelectorAll('[data-state="crossed"]')).toHaveLength(0)
  })

  it('continues a lost game with the same board after watching an ad', async () => {
    const { app, services } = await setup()
    await startQuickGame()
    TEST_WRONG_CELLS.forEach((cell) => tap(app, cell))
    const dialog = await screen.findByRole('dialog', { name: 'Perdiste' })

    services.ads.setRewardedResult('rewarded')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ver anuncio y seguir' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Perdiste' })).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Errores: 2/3')).toBeInTheDocument()
    expect(app.container.querySelectorAll('[data-state="crossed"]')).toHaveLength(3)
  })

  it('continues a lost game through the test ad dialog when ads are mocked', async () => {
    const mockAdStore = createMockAdStore()
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const ads = createMockAdService(mockAdStore.getState().present)
    const app = await renderApp({ ...services, ads }, '/', mockAdStore)
    await startQuickGame()
    TEST_WRONG_CELLS.forEach((cell) => tap(app, cell))
    const lost = await screen.findByRole('dialog', { name: 'Perdiste' })

    fireEvent.click(within(lost).getByRole('button', { name: 'Ver anuncio y seguir' }))
    const ad = await screen.findByRole('dialog', { name: 'Anuncio de prueba' })
    fireEvent.click(within(ad).getByRole('button', { name: 'Terminar de ver' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Perdiste' })).not.toBeInTheDocument(),
    )
    expect(screen.queryByRole('dialog', { name: 'Anuncio de prueba' })).not.toBeInTheDocument()
  })

  it('zooms the board with the buttons and still paints cells', async () => {
    const { app } = await setup()
    await startQuickGame()
    const zoomOut = screen.getByRole('button', { name: 'Alejar' })
    expect(zoomOut).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Acercar' }))
    expect(zoomOut).toBeEnabled()
    expect(screen.getByTestId('board').style.transform).toMatch(/^translate\(-16\.66/)
    tap(app, 1)
    expect(cellAt(app, 1).dataset.state).toBe('filled')

    fireEvent.click(screen.getByRole('button', { name: 'Ajustar tablero' }))
    expect(zoomOut).toBeDisabled()
    expect(screen.getByTestId('board').style.transform).toBe('translate(0%, 0%)')
  })

  it('paints a touch tap but not the first finger of a pinch', async () => {
    const { app } = await setup()
    await startQuickGame()
    const touch = { button: 0, pointerType: 'touch' }
    fireEvent.pointerDown(cellAt(app, 1), { ...touch, pointerId: 1 })
    fireEvent.pointerUp(cellAt(app, 1), { ...touch, pointerId: 1 })
    expect(cellAt(app, 1).dataset.state).toBe('filled')

    fireEvent.pointerDown(cellAt(app, 2), { ...touch, pointerId: 2 })
    fireEvent.pointerDown(cellAt(app, 3), { ...touch, pointerId: 3 })
    fireEvent.pointerUp(cellAt(app, 3), { ...touch, pointerId: 3 })
    fireEvent.pointerUp(cellAt(app, 2), { ...touch, pointerId: 2 })
    expect([2, 3].map((cell) => cellAt(app, cell).dataset.state)).toEqual(['unknown', 'unknown'])
  })

  it('marks cells with the cross tool', async () => {
    const { app } = await setup()
    await startQuickGame()
    fireEvent.click(screen.getByRole('button', { name: 'Marcar' }))
    tap(app, 0)
    expect(cellAt(app, 0)).toHaveAccessibleName('Fila 1, columna 1, marcada')
    expect(screen.getByText('Errores: 0/3')).toBeInTheDocument()
  })

  it('applies a line hint with an explanation and decrements the counter', async () => {
    const { app } = await setup()
    await startQuickGame()
    fireEvent.click(screen.getByRole('button', { name: /^Pista, 3/ }))
    expect(await screen.findByRole('status')).toHaveTextContent('Fila 3')
    expect(screen.getByRole('button', { name: /^Pista, 2/ })).toBeInTheDocument()
    expect(app.container.querySelectorAll('[aria-label$=", pista"]')).toHaveLength(5)
  })

  it('offers an ad once the free hints of the day run out and applies the extra hint', async () => {
    const { app, services } = await setup()
    await startQuickGame()
    const askHint = (): void => {
      fireEvent.click(screen.getByRole('button', { name: /^Pista,/ }))
    }
    askHint()
    askHint()
    askHint()
    expect(screen.getByRole('button', { name: 'Pista, 0 pistas gratis hoy' })).toBeInTheDocument()

    askHint()
    const offer = await screen.findByRole('dialog', { name: 'Sin pistas gratis' })
    fireEvent.click(within(offer).getByRole('button', { name: 'Ver anuncio' }))
    expect(await within(offer).findByRole('alert')).toHaveTextContent('No hay anuncios disponibles')

    services.ads.setRewardedResult('rewarded')
    fireEvent.click(within(offer).getByRole('button', { name: 'Ver anuncio' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Sin pistas gratis' })).not.toBeInTheDocument(),
    )
    expect(app.runtime.gameStore.getState().game?.hintsUsed).toBe(4)
    expect(services.ads.rewardedRequests).toEqual(['extraHint', 'extraHint'])
  })

  it('opens a collection puzzle with its tip and keeps its progress when leaving', async () => {
    const { app } = await setup()
    const [first] = COLLECTION[0].puzzles
    fireEvent.click(screen.getByRole('button', { name: /^Colección/ }))
    const [firstCard] = await screen.findAllByRole('button', { name: '?, sin empezar' })
    fireEvent.click(firstCard)
    await screen.findByRole('group', { name: 'Tablero del nonograma' })
    expect(screen.getByRole('status')).toHaveTextContent('Las pistas dicen')

    const firstFilled = [...first.solution].indexOf('#')
    tap(app, firstFilled)
    fireEvent.click(screen.getByRole('button', { name: 'Atrás' }))
    expect(await screen.findByRole('button', { name: /^\?, en curso/ })).toBeInTheDocument()
  })

  it('moves from victory to the next collection puzzle and back to the collection', async () => {
    const { app } = await setup()
    const [first, second] = COLLECTION[0].puzzles
    const solve = (solution: string): void =>
      [...solution].forEach((char, cell) => char === '#' && tap(app, cell))
    fireEvent.click(screen.getByRole('button', { name: /^Colección/ }))
    const [firstCard] = await screen.findAllByRole('button', { name: '?, sin empezar' })
    fireEvent.click(firstCard)
    await screen.findByRole('group', { name: 'Tablero del nonograma' })
    solve(first.solution)

    expect(await screen.findByText(first.name)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente puzzle' }))
    await screen.findByRole('group', { name: 'Tablero del nonograma' })
    await waitFor(() => expect(app.runtime.gameStore.getState().game?.puzzleId).toBe(second.id))
    solve(second.solution)

    fireEvent.click(await screen.findByRole('button', { name: 'Colección' }))
    expect(await screen.findByRole('heading', { name: 'Colección' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /resuelto en/ })).toHaveLength(2)
  })

  it('restores the saved game from home with its cells', async () => {
    const services = createTestServices(TEST_QUICK_PUZZLE)
    const first = await renderApp(services)
    await startQuickGame()
    tap(first, 1)
    await act(() => first.runtime.flushSave())
    first.unmount()
    first.runtime.dispose()

    const second = await renderApp(services)
    fireEvent.click(await screen.findByRole('button', { name: /^Continuar/ }))
    expect(cellAt(second, 1)).toHaveAccessibleName('Fila 1, columna 2, rellena')
    expect(screen.queryByRole('dialog', { name: 'Pausa' })).not.toBeInTheDocument()
  })

  it('pauses and saves when the app goes to background', async () => {
    const { app, services } = await setup()
    await startQuickGame()
    services.setNow(4_000)
    act(() => services.lifecycle.setActive(false))
    await act(() => app.runtime.flushSave())

    expect(screen.getByRole('dialog', { name: 'Pausa' })).toBeInTheDocument()
    expect((await services.persistence.loadLastGame())?.status).toBe('paused')
  })

  it('asks before abandoning an active quick game', async () => {
    const { app, services } = await setup()
    await startQuickGame()
    act(() => services.lifecycle.pressBack())
    await startQuickGameExpectingConfirm()
    await waitFor(() => expect(app.runtime.statsStore.getState().stats.global.abandoned).toBe(1))
  })

  it('handles the Android back button: game goes home, home exits', async () => {
    const { services } = await setup()
    await startQuickGame()
    act(() => services.lifecycle.pressBack())
    expect(await screen.findByRole('button', { name: /^Continuar/ })).toBeInTheDocument()
    act(() => services.lifecycle.pressBack())
    expect(services.lifecycle.exitCount()).toBe(1)
  })
})

async function startQuickGameExpectingConfirm(): Promise<void> {
  fireEvent.click(await screen.findByRole('button', { name: 'Partida rápida' }))
  const sheet = await screen.findByRole('dialog', { name: 'Partida rápida' })
  fireEvent.click(within(sheet).getByRole('button', { name: /^Medio/ }))
  const dialog = await screen.findByRole('dialog', { name: '¿Dejar la partida rápida?' })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Dejarla' }))
  await screen.findByRole('group', { name: 'Tablero del nonograma' })
}
