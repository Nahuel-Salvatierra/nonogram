import { DEFAULT_SETTINGS } from '@core/settings'
import { createTestGame } from '@core/game/__fixtures__/testGame'
import type { Stroke } from '@core/game/types'
import { describe, expect, it } from 'vitest'
import { buildCellViews, buildClueViews, strokeCount } from './selectors'

describe('game selectors', () => {
  it('highlights the row and column of the focused cell', () => {
    const game = createTestGame({ focusedCell: 7 })
    const cells = buildCellViews(game, DEFAULT_SETTINGS)
    const highlighted = cells.filter((cell) => cell.isHighlighted).map((cell) => cell.cell)
    expect(highlighted).toEqual([2, 5, 6, 7, 8, 9, 12, 17, 22])
    expect(buildCellViews(game, { ...DEFAULT_SETTINGS, highlightLines: false })).toSatisfy(
      (views: ReturnType<typeof buildCellViews>) => views.every((cell) => !cell.isHighlighted),
    )
  })

  it('marks completed and active clues', () => {
    const game = createTestGame({ board: '.###.', focusedCell: 0 })
    const clues = buildClueViews(game, DEFAULT_SETTINGS)
    expect(clues.rows[0]).toMatchObject({ numbers: [3], isDone: true, isActive: true })
    expect(clues.rows[1]).toMatchObject({ isDone: false, isActive: false })
    expect(clues.cols[0]).toMatchObject({ isActive: true })
    expect(
      buildClueViews(game, { ...DEFAULT_SETTINGS, dimCompletedClues: false }).rows[0].isDone,
    ).toBe(false)
  })

  it('exposes hint targets and the hinted line', () => {
    const game = createTestGame({
      lastHint: { kind: 'line', line: { axis: 'row', index: 2 }, cells: [10, 11], tier: 1 },
    })
    const cells = buildCellViews(game, DEFAULT_SETTINGS)
    expect(cells.filter((cell) => cell.isHintTarget).map((cell) => cell.cell)).toEqual([10, 11])
    expect(buildClueViews(game, DEFAULT_SETTINGS).rows[2].isHintLine).toBe(true)
  })

  it('counts painted cells only for multi-cell strokes', () => {
    const game = createTestGame()
    expect(strokeCount(game)).toBeNull()
    const stroke: Stroke = {
      origin: 0,
      from: 'unknown',
      to: 'filled',
      axis: 'row',
      batch: 1,
      visited: [0, 1, 2],
    }
    expect(strokeCount({ ...game, activeStroke: stroke })).toBe(3)
  })
})
