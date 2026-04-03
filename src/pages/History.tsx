import { useEffect, useState } from 'react'
import { deleteSession, getSessions } from '../db'
import type { Session } from '../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDuration(session: Session) {
  if (!session.finishedAt) return '—'
  const mins = Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export function History() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => getSessions(200).then(s => { setSessions(s); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this session?')) return
    await deleteSession(id)
    load()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-stone-400 text-sm">Loading…</div>
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">History</h1>

      {sessions.length === 0 ? (
        <p className="text-center text-stone-400 text-sm mt-16">No sessions logged yet.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className="bg-white border border-stone-200 rounded-2xl px-4 py-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-stone-900 text-sm">
                    {session.name ?? formatDate(session.startedAt)}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                    {' · '}
                    {session.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)} sets
                    {' · '}
                    {formatDuration(session)}
                  </p>
                </div>
                <button onClick={() => handleDelete(session.id)}
                  className="text-stone-300 hover:text-red-500 transition-colors text-xs ml-4 shrink-0">
                  Delete
                </button>
              </div>
              {session.exercises.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {session.exercises.map(ex => (
                    <span key={ex.id} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                      {ex.exerciseName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
