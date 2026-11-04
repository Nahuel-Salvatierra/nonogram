import { IconButton } from '@ui/components/IconButton/IconButton'
import { strings } from '@ui/strings/es'

type ZoomControlsProps = {
  canZoomIn: boolean
  canZoomOut: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function ZoomControls({
  canZoomIn,
  canZoomOut,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  return (
    <div
      role="group"
      aria-label={strings.game.zoomControls}
      className="mx-auto flex w-full max-w-[480px] justify-end gap-1"
    >
      <IconButton
        icon="zoomOut"
        label={strings.game.zoomOut}
        onClick={onZoomOut}
        isDisabled={!canZoomOut}
      />
      <IconButton
        icon="zoomIn"
        label={strings.game.zoomIn}
        onClick={onZoomIn}
        isDisabled={!canZoomIn}
      />
      <IconButton
        icon="fit"
        label={strings.game.zoomReset}
        onClick={onReset}
        isDisabled={!canZoomOut}
      />
    </div>
  )
}
