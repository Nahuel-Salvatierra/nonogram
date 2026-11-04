import { useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import {
  INITIAL_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  panBy,
  pinch,
  stepZoom,
  type BoardZoom,
  type PinchFrame,
  type Point,
} from './boardZoom'

type Gesture = {
  readonly start: BoardZoom
  readonly from: PinchFrame
}

export type ZoomHandlers = {
  readonly onPointerDown: (event: PointerEvent<HTMLElement>) => void
  readonly onPointerMove: (event: PointerEvent<HTMLElement>) => void
  readonly onPointerUp: (event: PointerEvent<HTMLElement>) => void
  readonly onPointerCancel: (event: PointerEvent<HTMLElement>) => void
  readonly onWheel: (event: WheelEvent<HTMLElement>) => void
}

export type BoardZoomControls = {
  readonly state: BoardZoom
  readonly setViewport: (element: HTMLDivElement | null) => void
  readonly handlers: ZoomHandlers
  readonly canZoomIn: boolean
  readonly canZoomOut: boolean
  readonly zoomIn: () => void
  readonly zoomOut: () => void
  readonly reset: () => void
}

const normalize = (point: Point, rect: DOMRect): Point => ({
  x: (point.x - rect.left) / rect.width,
  y: (point.y - rect.top) / rect.height,
})

export const useBoardZoom = (onGestureStart: () => void): BoardZoomControls => {
  const [state, setState] = useState<BoardZoom>(INITIAL_ZOOM)
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null)
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture | null>(null)

  const viewportRect = (): DOMRect | null => {
    const rect = viewport?.getBoundingClientRect()
    return rect && rect.width > 0 && rect.height > 0 ? rect : null
  }

  const currentFrame = (): PinchFrame | null => {
    const [a, b] = [...pointers.current.values()]
    const rect = viewportRect()
    if (!a || !b || !rect) return null
    return {
      center: normalize({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, rect),
      distance: Math.hypot(a.x - b.x, a.y - b.y),
    }
  }

  const release = (event: PointerEvent<HTMLElement>): void => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) gesture.current = null
  }

  const handlers: ZoomHandlers = {
    onPointerDown: (event) => {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (pointers.current.size !== 2) return
      onGestureStart()
      const from = currentFrame()
      if (from) gesture.current = { start: state, from }
    },
    onPointerMove: (event) => {
      if (!pointers.current.has(event.pointerId)) return
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      const current = gesture.current
      if (!current) return
      const to = currentFrame()
      if (to) setState(pinch(current.start, current.from, to))
    },
    onPointerUp: release,
    onPointerCancel: release,
    onWheel: (event) => {
      const rect = viewportRect()
      if (!rect) return
      setState((current) =>
        panBy(current, { x: -event.deltaX / rect.width, y: -event.deltaY / rect.height }),
      )
    },
  }

  return {
    state,
    setViewport,
    handlers,
    canZoomIn: state.zoom < MAX_ZOOM,
    canZoomOut: state.zoom > MIN_ZOOM,
    zoomIn: () => setState((current) => stepZoom(current, 1)),
    zoomOut: () => setState((current) => stepZoom(current, -1)),
    reset: () => setState(INITIAL_ZOOM),
  }
}
