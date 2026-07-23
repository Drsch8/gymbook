import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { EXERCISES, getExerciseById } from '../data/exercises'
import { getSessions } from '../db'
import { usePreferences } from '../hooks/usePreferences'
import type { Exercise, MuscleGroup, Session, WeightUnit } from '../types'

const LBS = 2.20462
const CATEGORY_LABEL: Record<string, string> = { strength: 'Strength', bodyweight: 'Bodyweight', cardio: 'Cardio', flexibility: 'Flexibility' }
const MUSCLE_LABEL: Record<MuscleGroup, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps',
  forearms: 'Forearms', abs: 'Abs', quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
  calves: 'Calves', full_body: 'Full body', cardio: 'Cardio',
}

function fmtWeight(kg: number, unit: WeightUnit) {
  return unit === 'lbs' ? `${(kg * LBS).toFixed(1)} lbs` : `${kg} kg`
}
function fmtDate(ymd: string) {
  return new Date(ymd + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Library list ───────────────────────────────────────────────────────────────

export function Library() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const grouped = useMemo(() => {
    const q = query.toLowerCase().trim()
    const list = q ? EXERCISES.filter(e => e.name.toLowerCase().includes(q)) : EXERCISES
    const map: Record<string, Exercise[]> = {}
    for (const e of list) {
      const key = e.muscleGroups[0] ?? 'full_body'
      ;(map[key] ??= []).push(e)
    }
    return map
  }, [query])

  const keys = Object.keys(grouped) as MuscleGroup[]

  return (
    <div className="bg-bg px-[18px] pt-safe min-h-full">
      <div className="pt-[26px] pb-4">
        <h1 className="font-display text-[26px] font-bold text-ink -tracking-wide">Library</h1>
      </div>

      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search exercises…"
          style={{ fontSize: '16px' }}
          className="w-full bg-surface border border-line rounded-card pl-9 pr-4 py-2.5 text-sm text-ink placeholder-faint focus:outline-none focus:border-brand transition-colors" />
      </div>

      <div className="pb-8 space-y-5">
        {keys.length === 0 && <p className="text-center text-faint text-sm py-8">No exercises match.</p>}
        {keys.map(key => (
          <div key={key}>
            <p className="text-[11px] font-bold font-body text-faint uppercase tracking-wider mb-2 px-1">{MUSCLE_LABEL[key]}</p>
            <div className="bg-surface border border-line rounded-panel divide-y divide-line overflow-hidden">
              {grouped[key].map(ex => (
                <button key={ex.id} onClick={() => navigate(`/library/${ex.id}`)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-elevated transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{ex.name}</p>
                    <p className="text-[11px] text-faint">{CATEGORY_LABEL[ex.category]}</p>
                  </div>
                  <svg className="w-4 h-4 text-faint shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Exercise detail ──────────────────────────────────────────────────────────

interface Appearance { date: string; bestReps?: number; bestWeight?: number; bestDuration?: number }

function collectHistory(sessions: Session[], exerciseId: string): { appearances: Appearance[]; pr: Appearance | null } {
  const appearances: Appearance[] = []
  let pr: Appearance | null = null
  for (const s of sessions) {
    const ex = s.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex) continue
    const done = ex.sets.filter(x => x.completed)
    if (done.length === 0) continue
    const a: Appearance = {
      date: s.date,
      bestReps: Math.max(...done.map(x => x.reps ?? 0)) || undefined,
      bestWeight: Math.max(...done.map(x => x.weight ?? 0)) || undefined,
      bestDuration: Math.max(...done.map(x => x.duration ?? 0)) || undefined,
    }
    appearances.push(a)
    if (!pr || (a.bestWeight ?? 0) > (pr.bestWeight ?? 0) || (a.bestReps ?? 0) > (pr.bestReps ?? 0)) {
      if (!pr || (a.bestWeight ?? 0) >= (pr.bestWeight ?? 0)) pr = a
    }
  }
  return { appearances, pr }
}

export function ExerciseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const exercise = id ? getExerciseById(id) : undefined
  const sessions = useLiveQuery(() => getSessions(500), []) ?? []

  const { appearances, pr } = useMemo(
    () => id ? collectHistory(sessions, id) : { appearances: [], pr: null },
    [sessions, id],
  )

  if (!exercise) {
    return (
      <div className="bg-bg min-h-full flex flex-col items-center justify-center gap-4">
        <p className="text-faint text-sm">Exercise not found.</p>
        <button onClick={() => navigate('/library')} className="text-brand text-sm font-semibold">← Library</button>
      </div>
    )
  }

  const unit = prefs.weightUnit
  const best = pr?.bestWeight ? fmtWeight(pr.bestWeight, unit) : pr?.bestReps ? `${pr.bestReps} reps` : pr?.bestDuration ? `${pr.bestDuration}s` : '—'

  return (
    <div className="bg-bg min-h-full">
      <header className="sticky top-0 z-40 bg-surface backdrop-blur border-b border-line px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-faint hover:text-ink transition-colors text-sm shrink-0">← Back</button>
        <span className="text-sm font-medium font-display text-ink truncate">{exercise.name}</span>
      </header>

      <div className="px-[18px] py-5 space-y-4 pb-8">
        <div className="bg-surface border border-line rounded-panel p-[18px]">
          <p className="text-[11px] font-bold font-body text-faint uppercase tracking-wider mb-1">{CATEGORY_LABEL[exercise.category]}</p>
          <h2 className="font-display text-[22px] font-bold text-ink mb-3">{exercise.name}</h2>
          <div className="flex flex-wrap gap-1.5">
            {exercise.muscleGroups.map(m => (
              <span key={m} className="text-[11px] font-medium bg-elevated text-muted px-2.5 py-1 rounded-full">{MUSCLE_LABEL[m]}</span>
            ))}
          </div>
        </div>

        {pr && (
          <div className="bg-surface border border-line rounded-panel p-[18px] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold font-body text-pr uppercase tracking-wider mb-1">★ Personal best</p>
              <p className="font-mono font-bold text-[24px] text-ink leading-none">{best}</p>
            </div>
            <p className="text-xs text-faint">{fmtDate(pr.date)}</p>
          </div>
        )}

        <div>
          <p className="text-[11px] font-bold font-body text-faint uppercase tracking-wider mb-2 px-1">
            History {appearances.length > 0 && `· ${appearances.length}`}
          </p>
          {appearances.length === 0 ? (
            <div className="bg-surface border border-line rounded-panel px-4 py-6 text-center">
              <p className="text-sm text-muted">You haven't logged this yet.</p>
            </div>
          ) : (
            <div className="bg-surface border border-line rounded-panel divide-y divide-line overflow-hidden">
              {appearances.map((a, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-muted">{fmtDate(a.date)}</span>
                  <span className="font-mono text-sm text-ink">
                    {a.bestWeight ? `${a.bestReps ?? '—'}×${fmtWeight(a.bestWeight, unit)}`
                      : a.bestDuration ? `${a.bestDuration}s`
                      : `${a.bestReps ?? '—'} reps`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
