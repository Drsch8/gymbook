import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSessions, getPreferences, resetPlan } from '../db'
import { nanoid } from '../utils/nanoid'
import { TRAINING_PLAN, PLAN_TOTAL } from '../data/trainingPlan'
import type { Session, SessionExercise } from '../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDuration(session: Session) {
  if (!session.finishedAt) return null
  const mins = Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function buildRepeatExercises(session: Session): SessionExercise[] {
  return session.exercises.map(ex => {
    const doneSets = ex.sets.filter(s => s.completed)
    const sets = (doneSets.length > 0 ? doneSets : ex.sets).map(s => ({
      id: nanoid(), reps: s.reps, weight: s.weight, duration: s.duration, completed: false,
    }))
    return { id: nanoid(), exerciseId: ex.exerciseId, exerciseName: ex.exerciseName, trackingType: ex.trackingType, sets }
  })
}

export function Home() {
  const navigate = useNavigate()
  const [recent, setRecent] = useState<Session[]>([])
  const [planIndex, setPlanIndex] = useState(0)

  useEffect(() => {
    getSessions(5).then(setRecent)
    getPreferences().then(p => setPlanIndex(p.planSessionIndex))
  }, [])

  const planDone = planIndex >= PLAN_TOTAL
  const nextSession = planDone ? null : TRAINING_PLAN[planIndex]

  function startPlanSession() {
    if (!nextSession) return
    const exercises: SessionExercise[] = nextSession.exercises.map(ex => ({
      id: nanoid(),
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      trackingType: ex.trackingType,
      sets: ex.sets.map(s => ({ id: nanoid(), ...s, completed: false })),
    }))
    navigate('/session/new', {
      state: {
        planSessionIndex: nextSession.index,
        name: nextSession.name,
        repeat: exercises,
      },
    })
  }

  async function handleResetPlan() {
    await resetPlan()
    setPlanIndex(0)
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-safe">
      <div className="pt-14 pb-6">
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">GymBook</h1>
        <p className="text-stone-500 mt-1 text-sm">Track your training. Own your progress.</p>
      </div>

      {/* ── Training Plan card ── */}
      <div className="mb-4 bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-4 pt-3 pb-2 border-b border-stone-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Fit ohne Geräte</span>
          {!planDone && (
            <span className="text-xs text-stone-400 font-mono">{planIndex + 1} / {PLAN_TOTAL}</span>
          )}
        </div>

        {planDone ? (
          <div className="px-4 py-5 text-center">
            <p className="text-base font-semibold text-stone-900 mb-1">Plan complete!</p>
            <p className="text-xs text-stone-400 mb-4">All 40 sessions done. Ready to start again?</p>
            <button
              onClick={handleResetPlan}
              className="px-5 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
            >
              Restart Plan
            </button>
          </div>
        ) : (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-stone-400 mb-0.5">
                  Week {nextSession!.week} · {nextSession!.phase} · Day {nextSession!.day}
                </p>
                <p className="text-lg font-bold text-stone-900">{nextSession!.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {nextSession!.exercises.map(e => e.exerciseName).join(' · ')}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-100 rounded-full h-1 mb-3">
              <div
                className="bg-stone-900 h-1 rounded-full transition-all"
                style={{ width: `${(planIndex / PLAN_TOTAL) * 100}%` }}
              />
            </div>

            <button
              onClick={startPlanSession}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-[0.98] transition text-white font-semibold text-sm"
            >
              Start Session
            </button>
          </div>
        )}
      </div>

      {/* ── Custom workout ── */}
      <Link
        to="/session/new"
        className="mb-8 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-medium hover:border-stone-400 hover:text-stone-700 bg-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Custom Workout
      </Link>

      {/* ── Recent sessions ── */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Recent</h2>
          <div className="space-y-2">
            {recent.map(session => {
              const completedSets = session.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
              const dur = formatDuration(session)
              return (
                <div key={session.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 transition-colors">
                  <div className="flex items-start gap-2 px-4 pt-3 pb-3">
                    <Link to={`/session/${session.id}`} className="flex-1 min-w-0">
                      <p className="text-stone-900 font-semibold text-sm truncate">
                        {session.name ? `${formatDate(session.startedAt)}, ${session.name}` : formatDate(session.startedAt)}
                      </p>
                      <p className="text-stone-400 text-xs mt-0.5">
                        {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                        {' · '}{completedSets} sets
                        {dur && ` · ${dur}`}
                      </p>
                      {session.exercises.length > 0 && (
                        <p className="mt-1.5 text-[11px] text-stone-400 leading-relaxed">
                          {session.exercises.map(e => e.exerciseName).join(' · ')}
                        </p>
                      )}
                    </Link>
                    {session.exercises.length > 0 && (
                      <button
                        onClick={() => navigate('/session/new', { state: { repeat: buildRepeatExercises(session) } })}
                        className="shrink-0 flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-900 transition-colors pt-0.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Repeat
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <Link to="/history" className="mt-3 block text-center text-xs text-stone-400 hover:text-stone-700 py-2 transition-colors">
            View all history →
          </Link>
        </section>
      )}

      {recent.length === 0 && (
        <p className="text-center text-stone-400 text-sm mt-8">No sessions yet.</p>
      )}
    </div>
  )
}
