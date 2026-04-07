import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSessions } from '../db'
import { nanoid } from '../utils/nanoid'
import type { Session, SessionExercise } from '../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDuration(session: Session) {
  if (!session.finishedAt) return null
  const mins = Math.round(
    (new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000,
  )
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

export function Recent() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    getSessions(100).then(setSessions)
  }, [])

  return (
    <div className="px-4 pt-safe">
      <div className="pt-14 pb-6">
        <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Recent</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">Your training history</p>
      </div>

      {sessions.length === 0 && (
        <p className="text-center text-stone-400 dark:text-stone-500 text-sm mt-8">No sessions yet.</p>
      )}

      <div className="space-y-2 pb-8">
        {sessions.map(session => {
          const completedSets = session.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
          const dur = formatDuration(session)
          return (
            <div key={session.id} className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden hover:border-stone-300 dark:hover:border-stone-600 transition-colors">
              <div className="flex items-start gap-2 px-4 pt-3 pb-3">
                <Link to={`/session/${session.id}`} className="flex-1 min-w-0">
                  <p className="text-stone-900 dark:text-stone-100 font-semibold text-sm truncate">
                    {session.name ? `${formatDate(session.startedAt)}, ${session.name}` : formatDate(session.startedAt)}
                  </p>
                  <p className="text-stone-400 dark:text-stone-500 text-xs mt-0.5">
                    {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                    {' · '}{completedSets} sets
                    {dur && ` · ${dur}`}
                  </p>
                  {session.exercises.length > 0 && (
                    <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500 leading-relaxed">
                      {session.exercises.map(e => e.exerciseName).join(' · ')}
                    </p>
                  )}
                </Link>
                {session.exercises.length > 0 && (
                  <button
                    onClick={() => navigate('/session/new', { state: { repeat: buildRepeatExercises(session) } })}
                    className="shrink-0 flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors pt-0.5"
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
    </div>
  )
}
