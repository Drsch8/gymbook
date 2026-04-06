import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSession } from '../db'
import { nanoid } from '../utils/nanoid'
import type { Session, SessionExercise } from '../types'

function buildRepeatExercises(session: Session): SessionExercise[] {
  return session.exercises.map(ex => {
    const doneSets = ex.sets.filter(s => s.completed)
    const sets = (doneSets.length > 0 ? doneSets : ex.sets).map(s => ({
      id: nanoid(),
      reps: s.reps,
      weight: s.weight,
      duration: s.duration,
      completed: false,
    }))
    return { id: nanoid(), exerciseId: ex.exerciseId, exerciseName: ex.exerciseName, trackingType: ex.trackingType, sets }
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatDuration(session: Session) {
  if (!session.finishedAt) return null
  const mins = Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getSession(id).then(s => { setSession(s ?? null); setLoading(false) })
  }, [id])

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-stone-400 text-sm">Loading…</div>
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-stone-400 text-sm">Session not found.</p>
        <button onClick={() => navigate('/')} className="text-sm text-stone-700 underline">← Home</button>
      </div>
    )
  }

  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0)
  const completedSets = session.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
  const duration = formatDuration(session)

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-stone-200 px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-stone-400 hover:text-stone-700 transition-colors text-sm shrink-0">
          ← Back
        </button>
        <span className="text-sm font-medium text-stone-700 truncate">
          {session.name ? `${formatDate(session.startedAt)}, ${session.name}` : formatDate(session.startedAt)}
        </span>
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* Summary card */}
        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-4">
          <p className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-3">Summary</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-stone-900">{session.exercises.length}</p>
              <p className="text-xs text-stone-400 mt-0.5">Exercises</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{completedSets}</p>
              <p className="text-xs text-stone-400 mt-0.5">Sets done</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{duration ?? '—'}</p>
              <p className="text-xs text-stone-400 mt-0.5">Duration</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between text-xs text-stone-400">
            <span>Started {formatTime(session.startedAt)}</span>
            {session.finishedAt && <span>Finished {formatTime(session.finishedAt)}</span>}
          </div>
        </div>

        {/* Exercises */}
        {session.exercises.map(ex => {
          const completedSets = ex.sets.filter(s => s.completed).length
          return (
            <div key={ex.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <span className="font-semibold text-stone-900 text-sm">{ex.exerciseName}</span>
                <span className="text-xs text-stone-400">{completedSets}/{ex.sets.length} sets</span>
              </div>

              <div className="px-4 py-3 space-y-1.5">
                {ex.sets.map((set, i) => (
                  <div key={set.id} className={`flex items-center gap-3 text-sm ${!set.completed ? 'opacity-40' : ''}`}>
                    <span className="w-5 text-center text-xs font-mono text-stone-400 shrink-0">{i + 1}</span>
                    <span className="flex-1 text-stone-700 font-mono">
                      {ex.trackingType === 'reps_weight' && (
                        <>{set.reps ?? '—'} reps × {set.weight ?? '—'} kg</>
                      )}
                      {ex.trackingType === 'reps_only' && (
                        <>{set.reps ?? '—'} reps</>
                      )}
                      {ex.trackingType === 'time' && (
                        <>{set.duration ?? '—'} s</>
                      )}
                    </span>
                    {set.completed && (
                      <span className="w-5 h-5 rounded-full bg-stone-900 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 10 8" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M1 4l3 3 5-6" />
                        </svg>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {totalSets === 0 && (
          <p className="text-center text-stone-400 text-sm py-8">No sets recorded.</p>
        )}

        {/* Repeat button */}
        {session.exercises.length > 0 && (
          <button
            onClick={() => navigate('/session/new', { state: { repeat: buildRepeatExercises(session) } })}
            className="w-full py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-[0.98] transition text-white font-semibold text-base shadow-sm"
          >
            Repeat this workout
          </button>
        )}
      </div>
    </div>
  )
}
