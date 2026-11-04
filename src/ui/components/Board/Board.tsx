import { strings } from '@ui/strings/es'
import { boardStyle } from './boardLayout'
import { contentTranslate } from './boardZoom'
import { Cell } from './Cell'
import { ClueLine } from './ClueLine'
import { useBoard } from './useBoard'
import { useBoardZoom } from './useBoardZoom'
import { usePaintStroke } from './usePaintStroke'
import { ZoomControls } from './ZoomControls'

export function Board() {
  const { size, cells, clues, layout, strokeCount } = useBoard()
  const paint = usePaintStroke(size)
  const { state, setViewport, handlers, canZoomIn, canZoomOut, zoomIn, zoomOut, reset } =
    useBoardZoom(paint.cancel)
  const translate = contentTranslate(state)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1">
      <ZoomControls
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={reset}
      />
      <div className="[container-type:size] flex min-h-0 flex-1 items-center justify-center">
        <div
          className="relative grid touch-none"
          style={boardStyle(layout, state.zoom)}
          {...handlers}
        >
          <div aria-hidden="true" />
          <div className="overflow-hidden">
            <div
              role="group"
              aria-label={strings.game.colClues}
              className="grid h-full items-end"
              style={{
                width: `calc(var(--cell) * ${size.cols})`,
                gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
                transform: `translateX(${translate.x}%)`,
              }}
            >
              {clues.cols.map((view) => (
                <ClueLine key={view.index} view={view} />
              ))}
            </div>
          </div>
          <div className="overflow-hidden">
            <div
              role="group"
              aria-label={strings.game.rowClues}
              className="grid"
              style={{
                height: `calc(var(--cell) * ${size.rows})`,
                gridTemplateRows: `repeat(${size.rows}, 1fr)`,
                transform: `translateY(${translate.y}%)`,
              }}
            >
              {clues.rows.map((view) => (
                <ClueLine key={view.index} view={view} />
              ))}
            </div>
          </div>
          <div
            ref={setViewport}
            className="overflow-hidden rounded-sm bg-cell ring-2 ring-line-strong"
          >
            <div
              role="group"
              aria-label={strings.game.boardLabel}
              data-testid="board"
              className="grid touch-none"
              style={{
                width: `calc(var(--cell) * ${size.cols})`,
                height: `calc(var(--cell) * ${size.rows})`,
                gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
                gridTemplateRows: `repeat(${size.rows}, 1fr)`,
                transform: `translate(${translate.x}%, ${translate.y}%)`,
              }}
              {...paint.handlers}
            >
              {cells.map((view) => (
                <Cell key={view.cell} view={view} />
              ))}
            </div>
          </div>
          {strokeCount !== null && (
            <span
              aria-hidden="true"
              className="absolute top-0 left-0 flex min-w-9 items-center justify-center rounded-full bg-accent px-2 py-1 text-sm font-bold text-accent-ink shadow-md"
            >
              {strings.game.strokeCount(strokeCount)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
