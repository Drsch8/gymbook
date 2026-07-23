import { Fragment, useEffect, useMemo, useState } from 'react'
import { getSessions, getBodyweightEntries, saveBodyweight } from '../db'
import { usePreferences } from '../hooks/usePreferences'
import type { Session, BodyweightEntry, WeightUnit } from '../types'

const LBS = 2.20462

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

  const last = dates[dates.length - 1]
  if (last === today || last === yesterday) {
    current = 1
    for (let i = dates.length - 2; i >= 0; i--) {
      const diff = (new Date(dates[i + 1]).getTime() - new Date(dates[i]).getTime()) / 86400000
      if (diff === 1) current++
      else break
    }
  }

  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000
    if (diff === 1) { streak++; best = Math.max(best, streak) }
    else streak = 1
  }
  best = Math.max(best, current, 1)

  return { current, best }
}

// ── Section wrapper + eyebrow ─────────────────────────────────────────────────

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-line rounded-panel px-4 py-4">
      {title && <p className="text-[11px] font-bold font-body text-faint uppercase tracking-wider mb-4">{title}</p>}
      {children}
    </div>
  )
}

// ── Charts ────────────────────────────────────────────────────────────────────

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
              <rect x={i * barW} y={0} width={barW} height={chartH} fill="transparent" />
              <rect x={x} y={y} width={w} height={h} rx={1.5}
                fill={d.count > 0 ? (tooltip === i ? 'var(--c-brand)' : 'var(--c-brand)') : 'var(--c-line)'}
                opacity={d.count > 0 && tooltip !== null && tooltip !== i ? 0.5 : 1} />
            </g>
          )
        })}
      </svg>

      {tooltip !== null && (
        <div className="absolute -top-8 pointer-events-none"
          style={{ left: `${(tooltip / data.length) * 100 + (0.5 / data.length) * 100}%`, transform: 'translateX(-50%)' }}>
          <div className="bg-ink text-bg text-[10px] font-mono px-2 py-1 rounded-card whitespace-nowrap">
            {data[tooltip].volume > 0
              ? `${(data[tooltip].volume / 1000).toFixed(1)}t · ${data[tooltip].count} sessions`
              : 'Rest'}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-1 px-0.5">
        {[0, Math.floor(data.length / 2), data.length - 1].map(i => (
          <span key={i} className="text-[10px] text-faint font-mono">{data[i]?.label}</span>
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
          <span className="text-xs text-muted w-32 shrink-0 truncate">{d.name}</span>
          <div className="flex-1 bg-elevated rounded-full h-2 overflow-hidden">
            <div className="bg-brand h-2 rounded-full transition-all duration-500" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
          <span className="text-xs text-faint font-mono w-8 text-right shrink-0">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

// ── Bodyweight ────────────────────────────────────────────────────────────────

function toDisplayWeight(kg: number, unit: WeightUnit) {
  return unit === 'lbs' ? +(kg * LBS).toFixed(1) : +kg.toFixed(1)
}
function toKg(val: number, unit: WeightUnit) {
  return unit === 'lbs' ? +(val / LBS).toFixed(2) : val
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const W = 100, H = 32
  const step = W / (points.length - 1)
  const coords = points.map((p, i) => `${(i * step).toFixed(1)},${(H - ((p - min) / range) * (H - 4) - 2).toFixed(1)}`)
  const last = coords[coords.length - 1].split(',')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
      <polyline points={coords.join(' ')} fill="none" stroke="var(--c-pr)" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2" fill="var(--c-pr)" />
    </svg>
  )
}

function BodyweightCard({ unit }: { unit: WeightUnit }) {
  const [entries, setEntries] = useState<BodyweightEntry[]>([])
  const [logging, setLogging] = useState(false)
  const [input, setInput] = useState('')

  const load = () => getBodyweightEntries().then(setEntries)
  useEffect(() => { load() }, [])

  // entries come newest-first; chronological for the sparkline
  const chrono = useMemo(() => [...entries].reverse(), [entries])
  const latest = entries[0]
  const prev = entries[1]
  const delta = latest && prev ? latest.weight - prev.weight : null

  async function log() {
    const val = parseFloat(input.replace(',', '.'))
    if (!isFinite(val) || val <= 0) return
    const today = toYMD(new Date())
    // id = date → one entry per day, re-logging updates it
    await saveBodyweight({ id: today, date: today, weight: toKg(val, unit) })
    setInput('')
    setLogging(false)
    load()
  }

  return (
    <Card title="Bodyweight">
      {latest ? (
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="font-mono font-bold text-[30px] text-ink leading-none">
              {toDisplayWeight(latest.weight, unit)}<span className="text-[15px] text-faint ml-1">{unit}</span>
            </p>
            {delta !== null && (
              <p className={`text-xs font-mono mt-1 ${delta === 0 ? 'text-faint' : delta < 0 ? 'text-done' : 'text-muted'}`}>
                {delta > 0 ? '+' : delta < 0 ? '−' : ''}{toDisplayWeight(Math.abs(delta), unit)} {unit} since last
              </p>
            )}
          </div>
          <button onClick={() => setLogging(v => !v)} className="text-[13px] font-semibold text-brand shrink-0">
            {logging ? 'Cancel' : '+ Log'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted">Track your weight over time.</p>
          <button onClick={() => setLogging(v => !v)} className="text-[13px] font-semibold text-brand shrink-0">
            {logging ? 'Cancel' : '+ Log'}
          </button>
        </div>
      )}

      {logging && (
        <div className="flex gap-2 mb-3">
          <input
            type="number" inputMode="decimal" value={input} autoFocus
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') log() }}
            placeholder={`Weight in ${unit}`} style={{ fontSize: '16px' }}
            className="flex-1 bg-bg border border-line rounded-card px-3 py-2 text-sm text-ink placeholder-faint focus:outline-none focus:border-brand"
          />
          <button onClick={log} className="px-4 rounded-card bg-brand text-brand-ink text-sm font-bold">Save</button>
        </div>
      )}

      {chrono.length >= 2 && <Sparkline points={chrono.map(e => e.weight)} />}
    </Card>
  )
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-line rounded-card px-3 py-3 text-center">
      <p className="text-xl font-bold font-mono text-ink leading-tight">{value}</p>
      <p className="text-[11px] text-faint mt-0.5">{label}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Statistics() {
  const { prefs } = usePreferences()
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
    return <div className="flex items-center justify-center h-64 text-faint text-sm">Loading…</div>
  }

  return (
    <div className="bg-bg px-[18px] pt-safe">
      <div className="pt-[26px] pb-5">
        <h1 className="font-display text-[26px] font-bold text-ink -tracking-wide">Stats</h1>
      </div>

      <div className="space-y-4 pb-8">
        {sessions.length === 0 ? (
          <Card>
            <p className="text-[15px] font-semibold text-ink mb-1">No training yet</p>
            <p className="text-sm text-muted">Log a session and your volume, streaks and records show up here.</p>
          </Card>
        ) : (
          <>
            {/* Lifetime tiles */}
            <div className="grid grid-cols-4 gap-2">
              <StatTile label="Sessions" value={sessions.length} />
              <StatTile label="Sets" value={totalSets} />
              <StatTile label="Volume" value={totalVol > 0 ? `${(totalVol / 1000).toFixed(1)}t` : '—'} />
              <StatTile label="Avg" value={avgDur ? `${avgDur}m` : '—'} />
            </div>

            {/* Streak */}
            <div className="bg-surface border border-line rounded-panel px-4 py-4 flex items-center justify-around">
              {[
                { v: streak.current, l: 'day streak' },
                { v: streak.best, l: 'best streak' },
                { v: new Set(sessions.map(s => s.date.slice(0, 7))).size, l: 'active months' },
              ].map((x, i) => (
                <Fragment key={i}>
                  {i > 0 && <div className="w-px h-10 bg-line" />}
                  <div className="text-center">
                    <p className="text-3xl font-bold font-mono text-ink">{x.v}</p>
                    <p className="text-xs text-faint mt-0.5">{x.l}</p>
                  </div>
                </Fragment>
              ))}
            </div>

            <Card title="Volume — last 10 weeks"><BarChart data={weeklyData} /></Card>

            <BodyweightCard unit={prefs.weightUnit} />

            {topExercises.length > 0 && (
              <Card title="Top exercises by sets"><HBarChart data={topExercises} /></Card>
            )}
          </>
        )}

        {sessions.length === 0 && <BodyweightCard unit={prefs.weightUnit} />}
      </div>
    </div>
  )
}
