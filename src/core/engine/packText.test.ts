import { describe, expect, it } from 'vitest'
import { parsePackText } from './packText'

const TEXT = `pack: tutorial
title: Primeros pasos

puzzle: heart
name: Corazón
.#.#.
#####

puzzle: plus
name: Cruz
..#..
#####
`

describe('parsePackText', () => {
  it('parses the header and every puzzle block', () => {
    const result = parsePackText(TEXT)
    expect(result).toEqual({
      ok: true,
      pack: {
        id: 'tutorial',
        title: 'Primeros pasos',
        puzzles: [
          { slug: 'heart', name: 'Corazón', rows: ['.#.#.', '#####'] },
          { slug: 'plus', name: 'Cruz', rows: ['..#..', '#####'] },
        ],
      },
    })
  })

  it('accepts Windows line endings', () => {
    expect(parsePackText(TEXT.replace(/\n/g, '\r\n')).ok).toBe(true)
  })

  it('rejects duplicated slugs and missing headers', () => {
    expect(parsePackText(`${TEXT}\npuzzle: heart\nname: Otro\n#`).ok).toBe(false)
    expect(parsePackText('title: Sin id').ok).toBe(false)
  })
})
