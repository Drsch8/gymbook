import Dexie, { type Table } from 'dexie'
import type { Session, Template, BodyweightEntry, UserPreferences, PlannedWorkout } from '../types'

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

// ── Preferences ────────────────────────────────────────────────────────────

const DEFAULT_PREFS: UserPreferences = {
  weightUnit: 'kg',
  restTimerDefault: 90,
  darkMode: true,
}

export async function getPreferences(): Promise<UserPreferences> {
  const row = await db.preferences.get(1)
  return row ?? DEFAULT_PREFS
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const current = await getPreferences()
  await db.preferences.put({ ...current, ...prefs, id: 1 })
}

// ── Sessions ───────────────────────────────────────────────────────────────

export async function saveSession(session: Session): Promise<void> {
  await db.sessions.put(session)
}

export async function getSession(id: string): Promise<Session | undefined> {
  return db.sessions.get(id)
}

export async function getSessions(limit = 50): Promise<Session[]> {
  return db.sessions.orderBy('startedAt').reverse().limit(limit).toArray()
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id)
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
}

export async function deletePlannedWorkout(id: string): Promise<void> {
  await db.planned.delete(id)
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
