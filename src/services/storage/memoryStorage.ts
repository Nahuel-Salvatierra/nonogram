import type { StorageAdapter } from './StorageAdapter'

export type MemoryStorage = StorageAdapter & {
  readonly snapshot: () => Readonly<Record<string, string>>
}

export const createMemoryStorage = (initial: Record<string, string> = {}): MemoryStorage => {
  const data = new Map<string, string>(Object.entries(initial))
  return {
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => {
      data.set(key, value)
    },
    remove: async (key) => {
      data.delete(key)
    },
    snapshot: () => Object.fromEntries(data),
  }
}
