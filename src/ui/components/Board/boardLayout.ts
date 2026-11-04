import type { CSSProperties } from 'react'

export const CLUE_SLOT = 0.55
export const MIN_CELL_PX = 14
export const MAX_CELL_PX = 56

export type BoardLayoutInput = {
  readonly rows: number
  readonly cols: number
  readonly rowClueLength: number
  readonly colClueLength: number
}

type BoardStyle = CSSProperties & Record<'--base' | '--cell', string>

export const boardStyle = (
  { rows, cols, rowClueLength, colClueLength }: BoardLayoutInput,
  zoom = 1,
): BoardStyle => {
  const clueWidth = rowClueLength * CLUE_SLOT
  const clueHeight = colClueLength * CLUE_SLOT
  const fitted = `min(100cqw / ${cols + clueWidth}, 100cqh / ${rows + clueHeight})`
  return {
    '--base': `clamp(${MIN_CELL_PX}px, ${fitted}, ${MAX_CELL_PX}px)`,
    '--cell': `calc(var(--base) * ${zoom})`,
    gridTemplateColumns: `calc(var(--base) * ${clueWidth}) calc(var(--base) * ${cols})`,
    gridTemplateRows: `calc(var(--base) * ${clueHeight}) calc(var(--base) * ${rows})`,
  }
}
