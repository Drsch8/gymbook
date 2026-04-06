import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions, getPlannedWorkouts, savePlannedWorkout, deletePlannedWorkout } from '../db'
import { nanoid } from '../utils/nanoid'
import type { Session, TrackingType, PlannedWorkout } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toYMD(date: Date) { return date.toISOString().slice(0, 10) }

function formatDuration(session: Session) {
  if (!session.finishedAt) return null
  const mins = Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function sessionVolume(session: Session) {
  return session.exercises.reduce((t, ex) =>
    t + ex.sets.filter(s => s.completed).reduce((u, s) => u + (s.reps ?? 0) * (s.weight ?? 0), 0), 0)
}

// ── Segmented control ─────────────────────────────────────────────────────────

type View = 'calendar' | 'feed' | 'records'

function SegmentedControl({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  const opts: { label: string; value: View }[] = [
    { label: 'Calendar', value: 'calendar' },
    { label: 'Feed',     value: 'feed' },
    { label: 'Records',  value: 'records' },
  ]
  return (
    <div className="flex bg-stone-100 rounded-xl p-1 gap-1">
      {opts.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === o.value ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Calendar view ─────────────────────────────────────────────────────────────

const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
function pad2(n: number) { return String(n).padStart(2, '0') }

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return [...Array<null>(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
}

const PLAN_CHIPS = ['Legs', 'Upper', 'Push', 'Pull', 'Core', 'Cardio', 'Full Body']

function CalendarView({ sessions, navigate: navigateTo }: { sessions: Session[]; navigate: (id: string) => void }) {
  const today = toYMD(new Date())
  const navigate = useNavigate()
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() } })
  const [selected, setSelected] = useState<string | null>(null)
  const [planned, setPlanned] = useState<PlannedWorkout[]>([])
  const [planTitle, setPlanTitle] = useState('')
  const [planning, setPlanning] = useState(false)

  useEffect(() => { getPlannedWorkouts().then(setPlanned) }, [])

  const sessionsByDate = useMemo(() => {
    const m: Record<string, Session[]> = {}
    sessions.forEach(s => { if (!m[s.date]) m[s.date] = []; m[s.date].push(s) })
    return m
  }, [sessions])

  const plannedByDate = useMemo(() => {
    const m: Record<string, PlannedWorkout> = {}
    planned.forEach(p => { m[p.date] = p })
    return m
  }, [planned])

  const { year, month } = viewDate
  const days = getCalendarDays(year, month)
  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const selectedSessions = selected ? (sessionsByDate[selected] ?? []) : []
  const selectedPlan = selected ? plannedByDate[selected] : null

  function handleDayClick(dateStr: string) {
    if (selected === dateStr) {
      setSelected(null)
      setPlanning(false)
    } else {
      setSelected(dateStr)
      setPlanning(false)
      setPlanTitle('')
    }
  }

  async function savePlan() {
    if (!selected) return
    const plan: PlannedWorkout = { id: nanoid(), date: selected, title: planTitle.trim() || undefined }
    await savePlannedWorkout(plan)
    setPlanned(prev => [...prev.filter(p => p.date !== selected), plan])
    setPlanning(false)
    setPlanTitle('')
  }

  async function removePlan(id: string) {
    await deletePlannedWorkout(id)
    setPlanned(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <button onClick={() => setViewDate(v => { const d = new Date(v.year, v.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() } })}
            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors text-lg">‹</button>
          <span className="text-sm font-semibold text-stone-900">{monthLabel}</span>
          <button onClick={() => setViewDate(v => { const d = new Date(v.year, v.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() } })}
            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors text-lg">›</button>
        </div>
        <div className="px-3 pb-3 pt-2">
          <div className="grid grid-cols-7 mb-1">
            {DOW.map(d => <div key={d} className="text-center text-[10px] font-medium text-stone-400 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />
              const dateStr = `${year}-${pad2(month + 1)}-${pad2(day)}`
              const hasSession = !!sessionsByDate[dateStr]
              const hasPlan = !!plannedByDate[dateStr]
              const isToday = dateStr === today
              const isSelected = dateStr === selected
              const isPast = dateStr < today
              const isMissed = hasPlan && isPast && !hasSession
              return (
                <button key={dateStr} onClick={() => handleDayClick(dateStr)}
                  className={[
                    'relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors text-sm',
                    isSelected ? 'bg-stone-900 text-white font-semibold' : '',
                    !isSelected && hasSession ? 'text-stone-700 hover:bg-stone-100 font-medium' : '',
                    !isSelected && !hasSession && hasPlan ? 'text-stone-600 hover:bg-stone-100 font-medium' : '',
                    !isSelected && !hasSession && !hasPlan && isPast ? 'text-stone-300' : '',
                    !isSelected && !hasSession && !hasPlan && !isPast && !isToday ? 'text-stone-400 hover:bg-stone-50' : '',
                    isToday && !isSelected ? 'ring-1 ring-stone-400' : '',
                  ].join(' ')}
                >
                  {day}
                  {hasSession && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-stone-900'}`} />
                  )}
                  {!hasSession && hasPlan && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full border ${
                      isSelected ? 'border-white' : isMissed ? 'border-stone-300' : 'border-stone-400'
                    }`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 pb-3 pt-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-900 inline-block" />
            <span className="text-[10px] text-stone-400">Logged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full border border-stone-400 inline-block" />
            <span className="text-[10px] text-stone-400">Planned</span>
          </div>
        </div>
      </div>

      {selected && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">
            {new Date(selected + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {selectedSessions.map(s => <SessionCard key={s.id} session={s} onClick={() => navigateTo(s.id)} />)}

          {selectedSessions.length === 0 && !selectedPlan && !planning && (
            <button
              onClick={() => setPlanning(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-sm hover:border-stone-400 hover:text-stone-600 bg-white transition-colors"
            >
              + Plan a workout
            </button>
          )}

          {planning && (
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 space-y-3">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Plan workout</p>
              <input
                type="text"
                value={planTitle}
                onChange={e => setPlanTitle(e.target.value)}
                placeholder="Title (optional)"
                style={{ fontSize: '16px' }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
              <div className="flex flex-wrap gap-1.5">
                {PLAN_CHIPS.map(chip => (
                  <button key={chip} onClick={() => setPlanTitle(prev => prev === chip ? '' : chip)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      planTitle === chip ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}>
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={savePlan}
                  className="flex-1 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors">
                  Save plan
                </button>
                <button onClick={() => { setPlanning(false); setPlanTitle('') }}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-500 text-sm hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {selectedPlan && selectedSessions.length === 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {selectedPlan.title ?? 'Planned workout'}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">Scheduled</p>
                </div>
                <button onClick={() => removePlan(selectedPlan.id)}
                  className="text-xs text-stone-400 hover:text-red-500 transition-colors">
                  Remove
                </button>
              </div>
              <button
                onClick={() => navigate('/session/new', { state: { name: selectedPlan.title } })}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
              >
                Start this workout
              </button>
            </div>
          )}

          {selectedPlan && selectedSessions.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-stone-400">
                Plan: {selectedPlan.title ?? 'Workout'} ✓
              </span>
              <button onClick={() => removePlan(selectedPlan.id)}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors">
                Remove plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Feed view ─────────────────────────────────────────────────────────────────

function FeedView({ sessions, navigate }: { sessions: Session[]; navigate: (id: string) => void }) {
  const grouped = useMemo(() => {
    const map: Record<string, Session[]> = {}
    for (const s of sessions) {
      const key = s.date.slice(0, 7)
      if (!map[key]) map[key] = []
      map[key].push(s)
    }
    return map
  }, [sessions])

  const months = Object.keys(grouped).sort().reverse()

  return (
    <div className="space-y-6">
      {months.map(key => {
        const [y, m] = key.split('-').map(Number)
        const label = new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">{label}</span>
              <span className="text-xs text-stone-400">{grouped[key].length} session{grouped[key].length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
              {grouped[key].map(s => <SessionCard key={s.id} session={s} onClick={() => navigate(s.id)} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Shared session card ───────────────────────────────────────────────────────

function SessionCard({ session, onClick }: { session: Session; onClick: () => void }) {
  const vol = sessionVolume(session)
  const dur = formatDuration(session)
  const sets = session.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
  const dateLabel = new Date(session.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <button onClick={onClick}
      className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-left hover:border-stone-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-stone-900 text-sm truncate">
            {session.name ? `${dateLabel}, ${session.name}` : dateLabel}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-400 flex-wrap">
            <span>{session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}</span>
            <span>{sets} sets</span>
            {dur && <span>{dur}</span>}
            {vol > 0 && <span>{(vol / 1000).toFixed(1)}t vol.</span>}
          </div>
        </div>
        <svg className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
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
    </button>
  )
}

// ── Records view ──────────────────────────────────────────────────────────────

interface PR {
  exerciseId: string
  exerciseName: string
  trackingType: TrackingType
  maxWeight?: number   // kg
  maxReps?: number
  maxDuration?: number // s
  achievedAt: string
}

function computeRecords(sessions: Session[]): PR[] {
  const map: Record<string, PR> = {}
  // Process oldest first so achievedAt reflects the date the PR was set
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  for (const session of sorted) {
    for (const ex of session.exercises) {
      if (!map[ex.exerciseId]) {
        map[ex.exerciseId] = { exerciseId: ex.exerciseId, exerciseName: ex.exerciseName, trackingType: ex.trackingType, achievedAt: session.date }
      }
      const pr = map[ex.exerciseId]
      for (const set of ex.sets.filter(s => s.completed)) {
        if (set.weight != null && (pr.maxWeight == null || set.weight > pr.maxWeight)) {
          pr.maxWeight = set.weight
          pr.achievedAt = session.date
        }
        if (set.reps != null && (pr.maxReps == null || set.reps > pr.maxReps)) {
          pr.maxReps = set.reps
        }
        if (set.duration != null && (pr.maxDuration == null || set.duration > pr.maxDuration)) {
          pr.maxDuration = set.duration
        }
      }
    }
  }
  return Object.values(map).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName))
}

function RecordsView({ sessions }: { sessions: Session[] }) {
  const records = useMemo(() => computeRecords(sessions), [sessions])
  const [filter, setFilter] = useState('')

  const filtered = records.filter(r => r.exerciseName.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input type="text" value={filter} onChange={e => setFilter(e.target.value)}
          placeholder="Filter exercises…" style={{ fontSize: '16px' }}
          className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors" />
      </div>

      {filtered.length === 0
        ? <p className="text-center text-stone-400 text-sm py-8">No records yet.</p>
        : (
          <div className="space-y-2">
            {filtered.map(pr => (
              <div key={pr.exerciseId} className="bg-white border border-stone-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900 text-sm truncate">{pr.exerciseName}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(pr.achievedAt + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {pr.trackingType === 'reps_weight' && pr.maxWeight != null && (
                    <p className="font-semibold text-stone-900 text-sm font-mono">{pr.maxWeight} kg</p>
                  )}
                  {pr.maxReps != null && (
                    <p className="text-xs text-stone-500 font-mono">{pr.maxReps} reps</p>
                  )}
                  {pr.trackingType === 'time' && pr.maxDuration != null && (
                    <p className="font-semibold text-stone-900 text-sm font-mono">{pr.maxDuration}s</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function History() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('calendar')

  useEffect(() => {
    getSessions(500).then(s => { setSessions(s); setLoading(false) })
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-stone-400 text-sm">Loading…</div>
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-stone-900">Calendar</h1>

      {sessions.length === 0 ? (
        <p className="text-center text-stone-400 text-sm mt-16">No sessions logged yet.</p>
      ) : (
        <>
          <SegmentedControl value={view} onChange={setView} />

          {view === 'calendar' && <CalendarView sessions={sessions} navigate={id => navigate(`/session/${id}`)} />}
          {view === 'feed'     && <FeedView     sessions={sessions} navigate={id => navigate(`/session/${id}`)} />}
          {view === 'records'  && <RecordsView  sessions={sessions} />}
        </>
      )}
    </div>
  )
}
