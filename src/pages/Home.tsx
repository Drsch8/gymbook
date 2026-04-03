import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSessions } from '../db'
import type { Session } from '../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDuration(session: Session) {
  if (!session.finishedAt) return null
  const mins = Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
  return `${mins} min`
}

export function Home() {
  const [recent, setRecent] = useState<Session[]>([])

  useEffect(() => { getSessions(5).then(setRecent) }, [])

  return (
    <div className="flex flex-col min-h-screen px-4 pt-safe">
      <div className="pt-14 pb-8">
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">GymBook</h1>
        <p className="text-stone-500 mt-1 text-sm">Track your training. Own your progress.</p>
      </div>

      <Link
        to="/session/new"
        className="mb-10 flex items-center justify-center gap-3 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-[0.98] transition text-white font-semibold text-base shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        New Training Day
      </Link>

      {recent.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Recent</h2>
          <div className="space-y-2">
            {recent.map(session => (
              <Link
                key={session.id}
                to={`/session/${session.id}`}
                className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl px-4 py-3 hover:border-stone-300 transition-colors"
              >
                <div>
                  <p className="text-stone-900 font-medium text-sm">
                    {session.name ?? formatDate(session.startedAt)}
                  </p>
                  <p className="text-stone-400 text-xs mt-0.5">
                    {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                    {' · '}
                    {session.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)} sets
                    {formatDuration(session) && ` · ${formatDuration(session)}`}
                  </p>
                </div>
                <svg className="w-4 h-4 text-stone-300 shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
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
