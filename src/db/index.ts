import Dexie, { type Table } from 'dexie'
import {
  doc, setDoc, deleteDoc, getDoc, getDocs, collection,
} from 'firebase/firestore'
import type { Session, Template, BodyweightEntry, UserPreferences, PlannedWorkout } from '../types'
import { auth, db as firestore } from '../lib/firebase'

export class GymBookDB extends Dexie {
  sessions!: Table<Session>
  templates!: Table<Template>
  bodyweight!: Table<BodyweightEntry>
  preferences!: Table<UserPreferences & { id: number }>
  planned!: Table<PlannedWorkout>

  constructor() {
    super('gymbook')

    this.version(1).stores({
      sessions:    '&id, date, startedAt',
      templates:   '&id, name, createdAt',
      bodyweight:  '&id, date',
      preferences: '&id',
    })

    this.version(2).stores({
      sessions:    '&id, date, startedAt',
      templates:   '&id, name, createdAt',
      bodyweight:  '&id, date',
      preferences: '&id',
      planned:     '&id, date',
    })
  }
}

export const db = new GymBookDB()

// ── Firestore helpers ──────────────────────────────────────────────────────

function uid(): string | null {
  return auth.currentUser?.uid ?? null
}

function sessionDoc(userId: string, id: string) {
  return doc(firestore, 'users', userId, 'sessions', id)
}

function prefsDoc(userId: string) {
  return doc(firestore, 'users', userId, 'preferences', 'default')
}

function plannedDoc(userId: string, id: string) {
  return doc(firestore, 'users', userId, 'planned_workouts', id)
}

// ── Preferences ────────────────────────────────────────────────────────────

const DEFAULT_PREFS: UserPreferences = {
  weightUnit: 'kg',
  restTimerDefault: 90,
  darkMode: false,
  planSessionIndex: 0,
  programProgress: {},
}

export async function getPreferences(): Promise<UserPreferences> {
  const row = await db.preferences.get(1)
  return row ?? DEFAULT_PREFS
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const current = await getPreferences()
  const next = { ...current, ...prefs }
  await db.preferences.put({ ...next, id: 1 })
  if ('darkMode' in prefs) {
    localStorage.setItem('gymbook_dark', String(next.darkMode))
    document.documentElement.classList.toggle('dark', next.darkMode)
  }
  const userId = uid()
  if (userId) {
    setDoc(prefsDoc(userId), next).catch(e => console.error('firebase savePreferences', e))
  }
}

export async function advancePlanSession(): Promise<void> {
  const current = await getPreferences()
  await savePreferences({ planSessionIndex: current.planSessionIndex + 1 })
}

export async function resetPlan(): Promise<void> {
  await savePreferences({ planSessionIndex: 0 })
}

export async function advanceFogProgram(programId: string): Promise<void> {
  const current = await getPreferences()
  const progress = { ...(current.programProgress ?? {}) }
  progress[programId] = (progress[programId] ?? 0) + 1
  await savePreferences({ programProgress: progress })
}

export async function resetFogProgram(programId: string): Promise<void> {
  const current = await getPreferences()
  const progress = { ...(current.programProgress ?? {}) }
  progress[programId] = 0
  await savePreferences({ programProgress: progress })
}

// ── Sessions ───────────────────────────────────────────────────────────────

export async function saveSession(session: Session): Promise<void> {
  await db.sessions.put(session)
  const userId = uid()
  if (userId) {
    setDoc(sessionDoc(userId, session.id), session).catch(e => console.error('firebase saveSession', e))
  }
}

export async function getSession(id: string): Promise<Session | undefined> {
  return db.sessions.get(id)
}

export async function getSessions(limit = 50): Promise<Session[]> {
  return db.sessions.orderBy('startedAt').reverse().limit(limit).toArray()
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id)
  const userId = uid()
  if (userId) {
    deleteDoc(sessionDoc(userId, id)).catch(e => console.error('firebase deleteSession', e))
  }
}

/** Returns the last session that included a given exerciseId, for progressive overload reference. */
export async function getLastSessionForExercise(exerciseId: string): Promise<Session | undefined> {
  const all = await db.sessions.orderBy('startedAt').reverse().toArray()
  return all.find(s => s.exercises.some(e => e.exerciseId === exerciseId))
}

// ── Planned workouts ───────────────────────────────────────────────────────

export async function getPlannedWorkouts(): Promise<PlannedWorkout[]> {
  return db.planned.orderBy('date').toArray()
}

export async function savePlannedWorkout(plan: PlannedWorkout): Promise<void> {
  await db.planned.put(plan)
  const userId = uid()
  if (userId) {
    setDoc(plannedDoc(userId, plan.id), plan).catch(e => console.error('firebase savePlannedWorkout', e))
  }
}

export async function deletePlannedWorkout(id: string): Promise<void> {
  await db.planned.delete(id)
  const userId = uid()
  if (userId) {
    deleteDoc(plannedDoc(userId, id)).catch(e => console.error('firebase deletePlannedWorkout', e))
  }
}

// ── Local data ────────────────────────────────────────────────────────────

export async function clearLocalData(): Promise<void> {
  await Promise.all([
    db.sessions.clear(),
    db.preferences.clear(),
    db.planned.clear(),
  ])
}

// ── Firebase sync (pull on login) ─────────────────────────────────────────

export async function syncFromFirebase(userId: string, clearFirst = false): Promise<void> {
  if (clearFirst) await clearLocalData()
  const [sessionsSnap, prefsSnap, plannedSnap] = await Promise.all([
    getDocs(collection(firestore, 'users', userId, 'sessions')),
    getDoc(prefsDoc(userId)),
    getDocs(collection(firestore, 'users', userId, 'planned_workouts')),
  ])

  if (!sessionsSnap.empty) {
    const sessions = sessionsSnap.docs.map(d => d.data() as Session)
    await db.sessions.bulkPut(sessions)
  }

  if (prefsSnap.exists()) {
    const prefs = prefsSnap.data() as UserPreferences
    await db.preferences.put({ ...prefs, id: 1 })
    localStorage.setItem('gymbook_dark', String(prefs.darkMode))
    document.documentElement.classList.toggle('dark', prefs.darkMode)
  }

  if (!plannedSnap.empty) {
    const planned = plannedSnap.docs.map(d => d.data() as PlannedWorkout)
    await db.planned.bulkPut(planned)
  }
}

// ── Templates ──────────────────────────────────────────────────────────────

export async function saveTemplate(template: Template): Promise<void> {
  await db.templates.put(template)
}

export async function getTemplates(): Promise<Template[]> {
  return db.templates.orderBy('createdAt').reverse().toArray()
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.templates.delete(id)
}

// ── Body weight ────────────────────────────────────────────────────────────

export async function saveBodyweight(entry: BodyweightEntry): Promise<void> {
  await db.bodyweight.put(entry)
}

export async function getBodyweightEntries(): Promise<BodyweightEntry[]> {
  return db.bodyweight.orderBy('date').reverse().toArray()
}

// ── Export ─────────────────────────────────────────────────────────────────

export async function exportToCSV(): Promise<string> {
  const sessions = await getSessions(10000)
  const rows: string[] = ['Date,Exercise,Set,Reps,Weight(kg),Duration(s)']

  for (const session of sessions) {
    for (const ex of session.exercises) {
      ex.sets.forEach((set, i) => {
        rows.push([
          session.date,
          `"${ex.exerciseName}"`,
          i + 1,
          set.reps ?? '',
          set.weight ?? '',
          set.duration ?? '',
        ].join(','))
      })
    }
  }

  return rows.join('\n')
}
