import { useEffect, useState } from 'react'
import { getPreferences, savePreferences } from '../db'
import type { UserPreferences } from '../types'

const DEFAULT: UserPreferences = {
  weightUnit: 'kg',
  restTimerDefault: 90,
  darkMode: true,
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT)

  useEffect(() => {
    getPreferences().then(setPrefs)
  }, [])

  const update = async (partial: Partial<UserPreferences>) => {
    const next = { ...prefs, ...partial }
    setPrefs(next)
    await savePreferences(next)
  }

  return { prefs, update }
}
