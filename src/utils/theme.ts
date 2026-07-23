import type { BaseTheme } from '../types'

// Base colour themes offered in Settings. `swatch` is only for the picker UI.
export const BASE_THEMES: { id: BaseTheme; label: string; swatch: string }[] = [
  { id: 'blue',   label: 'Steel',    swatch: 'oklch(0.50 0.09 230)' },
  { id: 'red',    label: 'Red',      swatch: 'oklch(0.55 0.19 25)' },
  { id: 'green',  label: 'Green',    swatch: 'oklch(0.52 0.13 150)' },
  { id: 'yellow', label: 'Amber',    swatch: 'oklch(0.70 0.14 85)' },
  { id: 'mono',   label: 'Original', swatch: 'oklch(0.30 0.006 70)' },
]

const KEY = 'gymbook_theme'

/** Persist + apply a base colour theme (sets the `data-theme` attribute the CSS keys off). */
export function applyTheme(theme: BaseTheme | undefined): void {
  const t = theme ?? 'blue'
  try { localStorage.setItem(KEY, t) } catch { /* ignore */ }
  document.documentElement.dataset.theme = t
}
