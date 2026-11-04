export type PackTextPuzzle = {
  readonly slug: string
  readonly name: string
  readonly rows: readonly string[]
}

export type PackText = {
  readonly id: string
  readonly title: string
  readonly puzzles: readonly PackTextPuzzle[]
}

export type PackTextResult =
  { readonly ok: true; readonly pack: PackText } | { readonly ok: false; readonly error: string }

const SLUG = /^[a-z0-9-]+$/

const field = (line: string | undefined, name: string): string | null => {
  const prefix = `${name}:`
  return line?.startsWith(prefix) ? line.slice(prefix.length).trim() : null
}

const parseBlock = (lines: readonly string[]): PackTextPuzzle | string => {
  const slug = field(lines[0], 'puzzle')
  const name = field(lines[1], 'name')
  if (slug === null || !SLUG.test(slug)) return `invalid puzzle slug in "${lines[0] ?? ''}"`
  if (name === null || name.length === 0) return `missing name for ${slug}`
  return { slug, name, rows: lines.slice(2) }
}

export const parsePackText = (text: string): PackTextResult => {
  const blocks = text
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((block) => block.length > 0)
  const [header, ...puzzleBlocks] = blocks
  const id = field(header?.[0], 'pack')
  const title = field(header?.[1], 'title')
  if (id === null || !SLUG.test(id)) return { ok: false, error: 'missing or invalid pack id' }
  if (title === null || title.length === 0) return { ok: false, error: `missing title in ${id}` }
  const puzzles: PackTextPuzzle[] = []
  for (const block of puzzleBlocks) {
    const parsed = parseBlock(block)
    if (typeof parsed === 'string') return { ok: false, error: `${id}: ${parsed}` }
    if (puzzles.some((puzzle) => puzzle.slug === parsed.slug)) {
      return { ok: false, error: `${id}: duplicated slug ${parsed.slug}` }
    }
    puzzles.push(parsed)
  }
  return { ok: true, pack: { id, title, puzzles } }
}
