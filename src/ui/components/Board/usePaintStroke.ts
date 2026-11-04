import { useRuntime } from '@app/AppRuntimeContext'
import { strokeSpan } from '@app/game/strokeSpan'
import { useGameActions } from '@app/hooks/useGameActions'
import type { Size } from '@core/engine/grid'
import { useEffect, useRef, type PointerEvent } from 'react'

export const DEAD_ZONE_PX = 6
export const TOUCH_DELAY_MS = 80

type ActiveStroke = {
  readonly pointerId: number
  readonly origin: number
  readonly startX: number
  readonly startY: number
  isMoving: boolean
  isPending: boolean
  lastTarget: number
  timer: ReturnType<typeof setTimeout> | null
}

export type PaintHandlers = {
  readonly onPointerDown: (event: PointerEvent<HTMLElement>) => void
  readonly onPointerMove: (event: PointerEvent<HTMLElement>) => void
  readonly onPointerUp: (event: PointerEvent<HTMLElement>) => void
  readonly onPointerCancel: (event: PointerEvent<HTMLElement>) => void
}

export type PaintStroke = {
  readonly handlers: PaintHandlers
  readonly cancel: () => void
}

const clamp = (value: number, max: number): number => Math.min(max, Math.max(0, value))

const dataCellOf = (target: EventTarget): number | null => {
  if (!(target instanceof HTMLElement) || target.dataset.cell === undefined) return null
  return Number(target.dataset.cell)
}

const cellFromPoint = (event: PointerEvent<HTMLElement>, size: Size): number | null => {
  const rect = event.currentTarget.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return null
  const col = clamp(
    Math.floor(((event.clientX - rect.left) / rect.width) * size.cols),
    size.cols - 1,
  )
  const row = clamp(
    Math.floor(((event.clientY - rect.top) / rect.height) * size.rows),
    size.rows - 1,
  )
  return row * size.cols + col
}

const clearTimer = (stroke: ActiveStroke): void => {
  if (stroke.timer !== null) clearTimeout(stroke.timer)
  stroke.timer = null
}

export const usePaintStroke = (size: Size): PaintStroke => {
  const { gameStore } = useRuntime()
  const { beginStroke, extendStroke, endStroke } = useGameActions()
  const active = useRef<ActiveStroke | null>(null)

  useEffect(
    () => () => {
      if (active.current) clearTimer(active.current)
    },
    [],
  )

  const start = (stroke: ActiveStroke): void => {
    clearTimer(stroke)
    if (!stroke.isPending) return
    stroke.isPending = false
    beginStroke(stroke.origin)
  }

  const finish = (event: PointerEvent<HTMLElement>): void => {
    const stroke = active.current
    if (stroke?.pointerId !== event.pointerId) return
    active.current = null
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    if (event.type === 'pointercancel' && stroke.isPending) {
      clearTimer(stroke)
      return
    }
    start(stroke)
    endStroke()
  }

  const cancel = (): void => {
    const stroke = active.current
    if (!stroke) return
    active.current = null
    clearTimer(stroke)
    if (!stroke.isPending) endStroke()
  }

  const handlers: PaintHandlers = {
    onPointerDown: (event) => {
      if (event.button !== 0 || active.current) return
      const cell = dataCellOf(event.target) ?? cellFromPoint(event, size)
      if (cell === null) return
      event.preventDefault()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      const stroke: ActiveStroke = {
        pointerId: event.pointerId,
        origin: cell,
        startX: event.clientX,
        startY: event.clientY,
        isMoving: false,
        isPending: true,
        lastTarget: cell,
        timer: null,
      }
      active.current = stroke
      if (event.pointerType === 'touch') {
        stroke.timer = setTimeout(() => start(stroke), TOUCH_DELAY_MS)
      } else {
        start(stroke)
      }
    },
    onPointerMove: (event) => {
      const stroke = active.current
      if (stroke?.pointerId !== event.pointerId) return
      if (!stroke.isMoving) {
        const distance = Math.hypot(event.clientX - stroke.startX, event.clientY - stroke.startY)
        if (distance < DEAD_ZONE_PX) return
        stroke.isMoving = true
        start(stroke)
      }
      const target = cellFromPoint(event, size) ?? dataCellOf(event.target)
      if (target === null || target === stroke.lastTarget) return
      stroke.lastTarget = target
      const axis = gameStore.getState().game?.activeStroke?.axis ?? null
      const cells = strokeSpan(size, stroke.origin, target, axis)
      if (cells.length > 0) extendStroke(cells)
    },
    onPointerUp: finish,
    onPointerCancel: finish,
  }

  return { handlers, cancel }
}
