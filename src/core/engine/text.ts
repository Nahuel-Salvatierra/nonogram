import type { Solution } from './clues'
import type { CellState, Size } from './grid'

const LINE_CHARS: Readonly<Record<string, CellState>> = {
  '.': 'unknown',
  '#': 'filled',
  x: 'crossed',
}
const LINE_SYMBOLS: Readonly<Record<CellState, string>> = {
  unknown: '.',
  filled: '#',
  crossed: 'x',
}
const CODE_OF: Readonly<Record<CellState, string>> = { unknown: 'u', filled: 'f', crossed: 'x' }
const STATE_OF_CODE: Readonly<Record<string, CellState>> = {
  u: 'unknown',
  f: 'filled',
  x: 'crossed',
}

const decode = (text: string, table: Readonly<Record<string, CellState>>): CellState[] | null => {
  const cells: CellState[] = []
  for (const char of text) {
    const state = table[char]
    if (state === undefined) return null
    cells.push(state)
  }
  return cells
}

export const parseLine = (text: string): CellState[] => decode(text, LINE_CHARS) ?? []

export const formatLine = (line: readonly CellState[]): string =>
  line.map((cell) => LINE_SYMBOLS[cell]).join('')

export const encodeCells = (cells: readonly CellState[]): string =>
  cells.map((cell) => CODE_OF[cell]).join('')

export const decodeCells = (text: string): CellState[] | null => decode(text, STATE_OF_CODE)

export type Pattern = { readonly size: Size; readonly solution: Solution }

export const parsePattern = (rows: readonly string[]): Pattern | null => {
  const cols = rows[0]?.length ?? 0
  if (cols === 0 || rows.some((row) => row.length !== cols || !/^[#.]+$/.test(row))) return null
  return {
    size: { rows: rows.length, cols },
    solution: rows.flatMap((row) => [...row].map((char) => char === '#')),
  }
}

export const formatPattern = (size: Size, solution: Solution): string[] =>
  Array.from({ length: size.rows }, (_, row) =>
    solution
      .slice(row * size.cols, (row + 1) * size.cols)
      .map((isFilled) => (isFilled ? '#' : '.'))
      .join(''),
  )

export const encodeSolution = (solution: Solution): string =>
  solution.map((isFilled) => (isFilled ? '#' : '.')).join('')

export const decodeSolution = (text: string): Solution => [...text].map((char) => char === '#')
