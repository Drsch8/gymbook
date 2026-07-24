import type { BaseTheme } from '../types'

// Base colour themes offered in Settings. `swatch` is only for the picker UI —
// it mirrors each theme's light-mode --c-brand so the dot matches the result.
export const BASE_THEMES: { id: BaseTheme; label: string; swatch: string }[] = [
  { id: 'blue',   label: 'Steel',    swatch: 'oklch(0.51 0.10 235)' },
  { id: 'red',    label: 'Red',      swatch: 'oklch(0.545 0.185 25)' },
  { id: 'green',  label: 'Green',    swatch: 'oklch(0.540 0.135 160)' },
  { id: 'yellow', label: 'Amber',    swatch: 'oklch(0.720 0.145 85)' },
  { id: 'silver', label: 'Silver',   swatch: 'oklch(0.640 0.020 255)' },
  { id: 'mono',   label: 'Original', swatch: 'oklch(0.28 0.006 70)' },
]

const KEY = 'gymbook_theme'

/** Persist + apply a base colour theme (sets the `data-theme` attribute the CSS keys off). */
export function applyTheme(theme: BaseTheme | undefined): void {
  const t = theme ?? 'blue'
  try { localStorage.setItem(KEY, t) } catch { /* ignore */ }
  document.documentElement.dataset.theme = t
}
