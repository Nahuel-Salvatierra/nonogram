export const CELL_STATES = ['unknown', 'filled', 'crossed'] as const

export type CellState = (typeof CELL_STATES)[number]

export type Line = readonly CellState[]

export type Size = { readonly rows: number; readonly cols: number }

export type Axis = 'row' | 'col'

export type LineRef = { readonly axis: Axis; readonly index: number }

export const cellCount = (size: Size): number => size.rows * size.cols

export const indexOf = (size: Size, row: number, col: number): number => row * size.cols + col

export const rowOf = (size: Size, cell: number): number => Math.floor(cell / size.cols)

export const colOf = (size: Size, cell: number): number => cell % size.cols

const range = (length: number, map: (i: number) => number): number[] =>
  Array.from({ length }, (_, i) => map(i))

export const rowCells = (size: Size, row: number): number[] =>
  range(size.cols, (col) => indexOf(size, row, col))

export const colCells = (size: Size, col: number): number[] =>
  range(size.rows, (row) => indexOf(size, row, col))

export const lineCells = (size: Size, line: LineRef): number[] =>
  line.axis === 'row' ? rowCells(size, line.index) : colCells(size, line.index)

export const allLines = (size: Size): LineRef[] => [
  ...range(size.rows, (i) => i).map((index): LineRef => ({ axis: 'row', index })),
  ...range(size.cols, (i) => i).map((index): LineRef => ({ axis: 'col', index })),
]

export const linesOfCell = (size: Size, cell: number): readonly [LineRef, LineRef] => [
  { axis: 'row', index: rowOf(size, cell) },
  { axis: 'col', index: colOf(size, cell) },
]

export const readLine = (cells: readonly CellState[], indices: readonly number[]): CellState[] =>
  indices.map((i) => cells[i])

export const emptyCells = (size: Size): CellState[] =>
  Array.from({ length: cellCount(size) }, () => 'unknown')

export const isSquare = (size: Size): boolean => size.rows === size.cols

export const sizeLabel = (size: Size): string => `${size.rows}x${size.cols}`
