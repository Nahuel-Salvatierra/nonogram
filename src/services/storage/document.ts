import { z } from 'zod'
import type { StorageAdapter } from './StorageAdapter'

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type Migration = {
  readonly fromVersion: number
  readonly migrate: (document: JsonValue) => JsonValue | null
}

export type DocumentSpec<T> = {
  readonly key: string
  readonly version: number
  readonly schema: z.ZodType<T>
  readonly migrations: readonly Migration[]
}

const versionProbe = z.object({ schemaVersion: z.number().int() })

const parseJson = (text: string): JsonValue | null => {
  try {
    const parsed: JsonValue = JSON.parse(text)
    return parsed
  } catch {
    return null
  }
}

const migrateToCurrent = (
  document: JsonValue,
  version: number,
  migrations: readonly Migration[],
): JsonValue | null => {
  let current: JsonValue | null = document
  for (let step = 0; step <= migrations.length && current !== null; step++) {
    const probe = versionProbe.safeParse(current)
    if (!probe.success) return null
    if (probe.data.schemaVersion === version) return current
    const migration = migrations.find((item) => item.fromVersion === probe.data.schemaVersion)
    if (!migration) return null
    current = migration.migrate(current)
  }
  return null
}

const parseDocument = <T>(text: string, spec: DocumentSpec<T>): T | null => {
  const raw = parseJson(text)
  const migrated = raw === null ? null : migrateToCurrent(raw, spec.version, spec.migrations)
  if (migrated === null) return null
  const result = z
    .object({ schemaVersion: z.literal(spec.version), data: spec.schema })
    .safeParse(migrated)
  return result.success ? result.data.data : null
}

export const loadDocument = async <T>(
  storage: StorageAdapter,
  spec: DocumentSpec<T>,
): Promise<T | null> => {
  try {
    const text = await storage.get(spec.key)
    if (text === null) return null
    const value = parseDocument(text, spec)
    if (value === null) await storage.remove(spec.key)
    return value
  } catch {
    return null
  }
}

export const saveDocument = async <T>(
  storage: StorageAdapter,
  spec: DocumentSpec<T>,
  value: T,
): Promise<void> => {
  try {
    await storage.set(spec.key, JSON.stringify({ schemaVersion: spec.version, data: value }))
  } catch {
    return
  }
}

export const removeDocument = async (storage: StorageAdapter, key: string): Promise<void> => {
  try {
    await storage.remove(key)
  } catch {
    return
  }
}
