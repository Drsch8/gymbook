import { useEffect, useMemo, useState } from 'react'
import { getSessions } from '../db'
import type { Session } from '../types'

// ── Data helpers ──────────────────────────────────────────────────────────────

function sessionVolume(s: Session) {
  return s.exercises.reduce((t, ex) =>
    t + ex.sets.filter(s => s.completed).reduce((u, set) => u + (set.reps ?? 0) * (set.weight ?? 0), 0), 0)
}

function toYMD(d: Date) { return d.toISOString().slice(0, 10) }

function startOfWeek(d: Date): Date {
  const r = new Date(d)
  const dow = (r.getDay() + 6) % 7 // Mon=0
  r.setDate(r.getDate() - dow)
  r.setHours(0, 0, 0, 0)
  return r
}

function getWeeklyVolume(sessions: Session[], nWeeks = 10) {
  const now = new Date()
  return Array.from({ length: nWeeks }, (_, i) => {
    const weekStart = startOfWeek(new Date(now.getTime() - (nWeeks - 1 - i) * 7 * 86400000))
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000)
    const weekSessions = sessions.filter(s => {
      const d = new Date(s.startedAt)
      return d >= weekStart && d < weekEnd
    })
    const vol = weekSessions.reduce((t, s) => t + sessionVolume(s), 0)
    const label = weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return { label, volume: vol, count: weekSessions.length }
  })
}

function getTopExercises(sessions: Session[], n = 6) {
  const freq: Record<string, { name: string; count: number }> = {}
  for (const s of sessions) {
    for (const ex of s.exercises) {
      if (!freq[ex.exerciseId]) freq[ex.exerciseId] = { name: ex.exerciseName, count: 0 }
      freq[ex.exerciseId].count += ex.sets.filter(s => s.completed).length
    }
  }
  return Object.values(freq).sort((a, b) => b.count - a.count).slice(0, n)
}

function getStreak(sessions: Session[]) {
  if (sessions.length === 0) return { current: 0, best: 0 }
  const dates = [...new Set(sessions.map(s => s.date))].sort()
  const today = toYMD(new Date())
  const yesterday = toYMD(new Date(Date.now() - 86400000))

  let current = 0
  let best = 0
  let streak = 1

  // Current streak: count consecutive days back from today/yesterday
  const last = dates[dates.length - 1]
  if (last === today || last === yesterday) {
    current = 1
    for (let i = dates.length - 2; i >= 0; i--) {
      const diff = (new Date(dates[i + 1]).getTime() - new Date(dates[i]).getTime()) / 86400000
      if (diff === 1) current++
      else break
    }
  }

  // Best streak: scan all dates
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000
    if (diff === 1) { streak++; best = Math.max(best, streak) }
    else streak = 1
  }
  best = Math.max(best, current, 1)

  return { current, best }
}

// ── Chart components ──────────────────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; volume: number; count: number }[] }) {
  const max = Math.max(...data.map(d => d.volume), 1)
  const [tooltip, setTooltip] = useState<number | null>(null)
  const chartH = 80
  const barW = 100 / data.length

  return (
    <div className="relative">
      <svg viewBox={`0 0 100 ${chartH}`} className="w-full" style={{ height: 100 }} preserveAspectRatio="none">
        {data.map((d, i) => {
          const h = Math.max((d.volume / max) * (chartH - 4), d.count > 0 ? 3 : 0)
          const x = i * barW + barW * 0.2
          const w = barW * 0.6
          const y = chartH - h
          return (
            <g key={i}
              onMouseEnter={() => setTooltip(i)}
              onMouseLeave={() => setTooltip(null)}
              onTouchStart={() => setTooltip(i)}
              onTouchEnd={() => setTooltip(null)}
              style={{ cursor: 'default' }}
            >
              {/* Background bar */}
              <rect x={i * barW} y={0} width={barW} height={chartH} fill="transparent" />
              {/* Data bar */}
              <rect x={x} y={y} width={w} height={h} rx={1.5}
                fill={tooltip === i ? '#44403c' : (d.count > 0 ? '#1c1917' : '#e7e5e4')} />
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip !== null && (
        <div className="absolute -top-8 pointer-events-none"
          style={{ left: `${(tooltip / data.length) * 100 + (0.5 / data.length) * 100}%`, transform: 'translateX(-50%)' }}>
          <div className="bg-stone-900 text-white text-[10px] font-mono px-2 py-1 rounded-lg whitespace-nowrap">
            {data[tooltip].volume > 0
              ? `${(data[tooltip].volume / 1000).toFixed(1)}t · ${data[tooltip].count} sessions`
              : 'Rest'}
          </div>
        </div>
      )}

      {/* X-axis labels — first, middle, last */}
      <div className="flex justify-between mt-1 px-0.5">
        {[0, Math.floor(data.length / 2), data.length - 1].map(i => (
          <span key={i} className="text-[10px] text-stone-400 font-mono">{data[i]?.label}</span>
        ))}
      </div>
    </div>
  )
}

function HBarChart({ data }: { data: { name: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="space-y-2.5">
      {data.map(d => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="text-xs text-stone-600 w-32 shrink-0 truncate">{d.name}</span>
          <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-stone-900 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-stone-400 font-mono w-8 text-right shrink-0">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl px-3 py-3 text-center">
      <p className="text-xl font-bold text-stone-900 leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-stone-400 font-mono">{sub}</p>}
      <p className="text-xs text-stone-400 mt-0.5">{label}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Statistics() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSessions(500).then(s => { setSessions(s); setLoading(false) })
  }, [])

  const weeklyData = useMemo(() => getWeeklyVolume(sessions, 10), [sessions])
  const topExercises = useMemo(() => getTopExercises(sessions, 6), [sessions])
  const streak = useMemo(() => getStreak(sessions), [sessions])

  const totalVol = sessions.reduce((t, s) => t + sessionVolume(s), 0)
  const totalSets = sessions.reduce((n, s) => n + s.exercises.reduce((m, e) => m + e.sets.filter(x => x.completed).length, 0), 0)
  const avgDur = (() => {
    const timed = sessions.filter(s => s.finishedAt)
    if (!timed.length) return null
    const avg = timed.reduce((t, s) => t + (new Date(s.finishedAt!).getTime() - new Date(s.startedAt).getTime()), 0) / timed.length
    return Math.round(avg / 60000)
  })()

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-stone-400 text-sm">Loading…</div>
  }

  if (sessions.length === 0) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Statistics</h1>
        <p className="text-stone-400 text-sm mb-8">Log some sessions to see your stats.</p>
        {['Volume', 'Progression', 'Frequency', 'Records'].map(label => (
          <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5 mb-3">
            <div className="h-2.5 w-20 bg-stone-100 rounded mb-4 animate-pulse" />
            <div className="h-24 bg-stone-100 rounded-xl animate-pulse" />
            <p className="text-xs text-stone-300 mt-3 text-center">{label}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-stone-900">Statistics</h1>

      {/* Lifetime tiles */}
      <div className="grid grid-cols-4 gap-2">
        <StatTile label="Sessions" value={sessions.length} />
        <StatTile label="Sets" value={totalSets} />
        <StatTile label="Volume" value={totalVol > 0 ? `${(totalVol / 1000).toFixed(1)}t` : '—'} />
        <StatTile label="Avg time" value={avgDur ? `${avgDur}m` : '—'} />
      </div>

      {/* Streak */}
      <div className="bg-white border border-stone-200 rounded-2xl px-4 py-4 flex items-center justify-around">
        <div className="text-center">
          <p className="text-3xl font-bold text-stone-900">{streak.current}</p>
          <p className="text-xs text-stone-400 mt-0.5">day streak</p>
        </div>
        <div className="w-px h-10 bg-stone-100" />
        <div className="text-center">
          <p className="text-3xl font-bold text-stone-900">{streak.best}</p>
          <p className="text-xs text-stone-400 mt-0.5">best streak</p>
        </div>
        <div className="w-px h-10 bg-stone-100" />
        <div className="text-center">
          <p className="text-3xl font-bold text-stone-900">
            {new Set(sessions.map(s => s.date.slice(0, 7))).size}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">active months</p>
        </div>
      </div>

      {/* Weekly volume chart */}
      <div className="bg-white border border-stone-200 rounded-2xl px-4 py-4">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Volume — last 10 weeks</p>
        <BarChart data={weeklyData} />
      </div>

      {/* Top exercises */}
      {topExercises.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-4">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Top exercises by sets</p>
          <HBarChart data={topExercises} />
        </div>
      )}
    </div>
  )
}
