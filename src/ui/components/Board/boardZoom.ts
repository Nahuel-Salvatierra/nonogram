export const MIN_ZOOM = 1
export const MAX_ZOOM = 3
export const ZOOM_STEP = 0.5

export type Point = { readonly x: number; readonly y: number }

export type BoardZoom = {
  readonly zoom: number
  readonly pan: Point
}

export type PinchFrame = {
  readonly center: Point
  readonly distance: number
}

export const INITIAL_ZOOM: BoardZoom = { zoom: MIN_ZOOM, pan: { x: 0, y: 0 } }

const VIEWPORT_CENTER: Point = { x: 0.5, y: 0.5 }

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const clampZoom = (zoom: number): number => clamp(zoom, MIN_ZOOM, MAX_ZOOM)

export const clampPan = (pan: Point, zoom: number): Point => ({
  x: clamp(pan.x, 0, zoom - 1),
  y: clamp(pan.y, 0, zoom - 1),
})

export const zoomAround = (state: BoardZoom, nextZoom: number, focus: Point): BoardZoom => {
  const zoom = clampZoom(nextZoom)
  const ratio = zoom / state.zoom
  return {
    zoom,
    pan: clampPan(
      {
        x: (state.pan.x + focus.x) * ratio - focus.x,
        y: (state.pan.y + focus.y) * ratio - focus.y,
      },
      zoom,
    ),
  }
}

export const panBy = (state: BoardZoom, delta: Point): BoardZoom => ({
  zoom: state.zoom,
  pan: clampPan({ x: state.pan.x - delta.x, y: state.pan.y - delta.y }, state.zoom),
})

export const pinch = (start: BoardZoom, from: PinchFrame, to: PinchFrame): BoardZoom => {
  const scale = from.distance === 0 ? 1 : to.distance / from.distance
  const zoomed = zoomAround(start, start.zoom * scale, from.center)
  return panBy(zoomed, { x: to.center.x - from.center.x, y: to.center.y - from.center.y })
}

export const stepZoom = (state: BoardZoom, direction: 1 | -1): BoardZoom =>
  zoomAround(state, state.zoom + direction * ZOOM_STEP, VIEWPORT_CENTER)

export const contentTranslate = ({ zoom, pan }: BoardZoom): Point => ({
  x: -(pan.x / zoom) * 100,
  y: -(pan.y / zoom) * 100,
})
