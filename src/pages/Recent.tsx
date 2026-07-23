import { useLiveQuery } from 'dexie-react-hooks'
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
  const sessions = useLiveQuery(() => getSessions(100), []) ?? []

  return (
    <div className="bg-bg px-[18px] pt-safe">
      <div className="pt-[26px] pb-6">
        <h1 className="font-display text-[26px] font-bold text-ink -tracking-wide">Recent</h1>
        <p className="text-muted mt-1 text-sm">Your training history</p>
      </div>

      {sessions.length === 0 && (
        <p className="text-center text-faint text-sm mt-8">No sessions yet.</p>
      )}

      <div className="space-y-2 pb-8">
        {sessions.map(session => {
          const completedSets = session.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
          const dur = formatDuration(session)
          return (
            <div key={session.id} className="bg-surface border border-line rounded-panel overflow-hidden hover:border-faint transition-colors">
              <div className="flex items-start gap-2 px-4 pt-3 pb-3">
                <Link to={`/session/${session.id}`} className="flex-1 min-w-0">
                  <p className="text-ink font-semibold text-sm truncate">
                    {session.name ? `${formatDate(session.startedAt)}, ${session.name}` : formatDate(session.startedAt)}
                  </p>
                  <p className="text-faint text-xs mt-0.5">
                    {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                    {' · '}{completedSets} set{completedSets !== 1 ? 's' : ''}
                    {dur && ` · ${dur}`}
                  </p>
                  {session.exercises.length > 0 && (
                    <p className="mt-1.5 text-[11px] text-faint leading-relaxed">
                      {session.exercises.map(e => e.exerciseName).join(' · ')}
                    </p>
                  )}
                </Link>
                {session.exercises.length > 0 && (
                  <button
                    onClick={() => navigate('/session/new', { state: { repeat: buildRepeatExercises(session) } })}
                    className="shrink-0 flex items-center gap-1 text-xs font-medium text-faint hover:text-ink transition-colors pt-0.5"
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
