import type { SessionExercise } from '../types'

const KEY = 'gymbook_draft'

export interface SessionDraft {
  id: string
  exercises: SessionExercise[]
  sessionTags: string[]
  startedAt: string
  updatedAt: string
  fogProgramId?: string
  method?: string
  displayName?: string
  locationState: unknown
}

export function saveDraft(draft: Omit<SessionDraft, 'updatedAt'>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }))
  } catch {}
}

export function loadDraft(): SessionDraft | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SessionDraft) : null
  } catch { return null }
}

export function clearDraft(): void {
  localStorage.removeItem(KEY)
}
