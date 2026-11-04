import { cn } from '@ui/lib/cn'

type MiniLineProps = {
  clue: string
  pattern: string
}

export function MiniLine({ clue, pattern }: MiniLineProps) {
  return (
    <div aria-hidden="true" className="flex items-center gap-2">
      <span className="w-10 text-right text-sm font-semibold tabular-nums">{clue}</span>
      <div className="flex border-2 border-line-strong">
        {[...pattern].map((char, index) => (
          <span
            key={index}
            className={cn(
              'flex size-7 items-center justify-center border-line text-cell-crossed',
              index > 0 && 'border-l',
              char === '#' ? 'bg-cell-filled' : 'bg-cell',
            )}
          >
            {char === 'x' && '×'}
          </span>
        ))}
      </div>
    </div>
  )
}
