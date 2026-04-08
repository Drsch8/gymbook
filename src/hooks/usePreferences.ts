import { useLiveQuery } from 'dexie-react-hooks'
import { db, savePreferences } from '../db'
import type { UserPreferences } from '../types'

const DEFAULT: UserPreferences = {
  weightUnit: 'kg',
  restTimerDefault: 90,
  darkMode: true,
  planSessionIndex: 0,
  programProgress: {},
}

export function usePreferences() {
  const row = useLiveQuery(() => db.preferences.get(1), [])
  const prefs: UserPreferences = row ?? DEFAULT

  const update = async (partial: Partial<UserPreferences>) => {
    await savePreferences(partial)
  }

  return { prefs, update }
}
