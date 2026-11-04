import { Preferences } from '@capacitor/preferences'
import type { StorageAdapter } from './StorageAdapter'

export const createCapacitorStorage = (): StorageAdapter => ({
  get: async (key) => (await Preferences.get({ key })).value,
  set: async (key, value) => {
    await Preferences.set({ key, value })
  },
  remove: async (key) => {
    await Preferences.remove({ key })
  },
})
