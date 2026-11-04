import { describe, expect, it } from 'vitest'
import {
  clampPan,
  clampZoom,
  contentTranslate,
  INITIAL_ZOOM,
  MAX_ZOOM,
  panBy,
  pinch,
  stepZoom,
  zoomAround,
} from './boardZoom'

describe('boardZoom', () => {
  it('clamps the zoom level between 1x and the maximum', () => {
    expect(clampZoom(0.4)).toBe(1)
    expect(clampZoom(2)).toBe(2)
    expect(clampZoom(10)).toBe(MAX_ZOOM)
  })

  it('keeps the pan inside the zoomed content', () => {
    expect(clampPan({ x: -1, y: 5 }, 2)).toEqual({ x: 0, y: 1 })
    expect(clampPan({ x: 0.3, y: 0.3 }, 1)).toEqual({ x: 0, y: 0 })
  })

  it('zooms around a focus point keeping it in place', () => {
    const zoomed = zoomAround(INITIAL_ZOOM, 2, { x: 0.5, y: 0.5 })
    expect(zoomed).toEqual({ zoom: 2, pan: { x: 0.5, y: 0.5 } })
    const corner = zoomAround(INITIAL_ZOOM, 2, { x: 1, y: 0 })
    expect(corner.pan).toEqual({ x: 1, y: 0 })
  })

  it('resets the pan when zooming back to 1x', () => {
    const zoomed = zoomAround(INITIAL_ZOOM, 3, { x: 0.8, y: 0.2 })
    expect(zoomAround(zoomed, 1, { x: 0.5, y: 0.5 })).toEqual(INITIAL_ZOOM)
  })

  it('pans opposite to the finger movement', () => {
    const zoomed = zoomAround(INITIAL_ZOOM, 2, { x: 0.5, y: 0.5 })
    expect(panBy(zoomed, { x: 0.25, y: -0.25 }).pan).toEqual({ x: 0.25, y: 0.75 })
  })

  it('combines scale and translation in a pinch', () => {
    const state = pinch(
      INITIAL_ZOOM,
      { center: { x: 0.5, y: 0.5 }, distance: 100 },
      { center: { x: 0.4, y: 0.5 }, distance: 200 },
    )
    expect(state.zoom).toBe(2)
    expect(state.pan.x).toBeCloseTo(0.6)
    expect(state.pan.y).toBeCloseTo(0.5)
  })

  it('steps the zoom from the viewport center within the limits', () => {
    expect(stepZoom(INITIAL_ZOOM, 1).zoom).toBe(1.5)
    expect(stepZoom(INITIAL_ZOOM, -1)).toEqual(INITIAL_ZOOM)
  })

  it('converts the pan to a percentage translation of the content', () => {
    expect(contentTranslate({ zoom: 2, pan: { x: 1, y: 0.5 } })).toEqual({ x: -50, y: -25 })
  })
})
