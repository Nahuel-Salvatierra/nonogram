import type { Solution } from '@core/engine/clues'
import type { Size } from '@core/engine/grid'
import { cn } from '@ui/lib/cn'

type PixelArtProps = {
  size: Size
  pixels: Solution
  className?: string
  pixelClassName?: string
}

export function PixelArt({
  size,
  pixels,
  className,
  pixelClassName = 'bg-cell-filled',
}: PixelArtProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
        aspectRatio: `${size.cols} / ${size.rows}`,
      }}
    >
      {pixels.map((isFilled, index) => (
        <span key={index} className={cn(isFilled && pixelClassName)} />
      ))}
    </div>
  )
}
