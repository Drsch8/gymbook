import type { BaseTheme } from '../types'

// Base colour themes offered in Settings. `swatch` is only for the picker UI —
// it points at a --sw-* token that tracks that theme's --c-brand for the
// current light/dark mode, so each dot previews what you'd actually get.
export const BASE_THEMES: { id: BaseTheme; label: string; swatch: string }[] = [
  { id: 'blue',   label: 'Steel',    swatch: 'var(--sw-blue)' },
  { id: 'red',    label: 'Red',      swatch: 'var(--sw-red)' },
  { id: 'green',  label: 'Green',    swatch: 'var(--sw-green)' },
  { id: 'yellow', label: 'Amber',    swatch: 'var(--sw-yellow)' },
  { id: 'silver', label: 'Silver',   swatch: 'var(--sw-silver)' },
  { id: 'mono',   label: 'Original', swatch: 'var(--sw-mono)' },
]

const KEY = 'gymbook_theme'

/** Persist + apply a base colour theme (sets the `data-theme` attribute the CSS keys off). */
export function applyTheme(theme: BaseTheme | undefined): void {
  const t = theme ?? 'blue'
  try { localStorage.setItem(KEY, t) } catch { /* ignore */ }
  document.documentElement.dataset.theme = t
}
