import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { loadDraft, clearDraft } from '../utils/draft'
import { getSessions, getPlannedWorkouts } from '../db'
import { usePreferences } from '../hooks/usePreferences'
import { buildClassStartState, findActiveProgramId } from '../utils/classSession'
import { FOG_PROGRAMS, flattenFogProgram } from '../data/fogPrograms'
import type { Session } from '../types'

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const PAST_DAYS = 7
const FUTURE_DAYS = 3

function toYMD(d: Date) { return d.toISOString().slice(0, 10) }

function addDays(d: Date, n: number) {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

function startOfWeek(d: Date): Date {
  const r = new Date(d)
  const dow = (r.getDay() + 6) % 7 // Mon=0
  r.setDate(r.getDate() - dow)
  r.setHours(0, 0, 0, 0)
  return r
}

function completedSets(session: Session): number {
  return session.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
}

// ── Rail — 7 days of history + today + a few days of plan ──────────────────

interface RailPastDay { kind: 'past'; label: string; intensity: number }
interface RailTodayDay { kind: 'today'; label: string }
interface RailFutureDay { kind: 'future'; label: string; planned: boolean }
type RailDay = RailPastDay | RailTodayDay | RailFutureDay

function Rail({ days, onSelect }: { days: RailDay[]; onSelect: () => void }) {
  return (
    <div className="flex gap-[5px] mb-1.5">
      {days.map((d, i) => (
        <button key={i} onClick={onSelect} className="flex-1 flex flex-col items-center gap-1.5">
          {d.kind === 'past' && (
            <div className="w-full h-11 rounded-[5px] bg-elevated flex items-end overflow-hidden">
              <div
                className="w-full rounded-[5px] bg-brand transition-all"
                style={{ height: `${Math.max(d.intensity, 0.04) * 100}%`, opacity: d.intensity > 0 ? 0.45 + d.intensity * 0.55 : 0 }}
              />
            </div>
          )}
          {d.kind === 'today' && (
            <div className="w-full h-11 rounded-[5px] bg-brand flex items-center justify-center ring-2 ring-offset-2 ring-offset-bg ring-brand">
              <div className="w-[7px] h-[7px] rounded-full bg-brand-ink" />
            </div>
          )}
          {d.kind === 'future' && (
            <div className="w-full h-11 rounded-[5px] border-[1.5px] border-dashed border-line flex items-center justify-center">
              {d.planned && <div className="w-[5px] h-[5px] rounded-full bg-faint" />}
            </div>
          )}
          <span className="text-[9px] font-bold font-body text-faint">{d.label}</span>
        </button>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function Home() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => loadDraft())
  const { prefs } = usePreferences()
  const sessions = useLiveQuery(() => getSessions(90), []) ?? []
  const planned = useLiveQuery(() => getPlannedWorkouts(), []) ?? []

  const today = useMemo(() => new Date(), [])
  const todayYMD = toYMD(today)
  const programProgress = prefs.programProgress ?? {}

  const activeProgramId = useMemo(
    () => findActiveProgramId(FOG_PROGRAMS, programProgress, flattenFogProgram),
    [programProgress],
  )
  const activeProgram = FOG_PROGRAMS.find(p => p.id === activeProgramId) ?? null
  const flat = activeProgram ? flattenFogProgram(activeProgram) : []
  const sessionIndex = activeProgramId ? (programProgress[activeProgramId] ?? 0) : 0
  const nextSession = flat[sessionIndex]

  const trainedToday = sessions.some(s => s.date === todayYMD)

  const railDays: RailDay[] = useMemo(() => {
    const past: RailPastDay[] = []
    for (let i = PAST_DAYS; i >= 1; i--) {
      const d = addDays(today, -i)
      const ymd = toYMD(d)
      const sets = sessions.filter(s => s.date === ymd).reduce((n, s) => n + completedSets(s), 0)
      past.push({ kind: 'past', label: DOW[d.getDay()], intensity: sets })
    }
    const maxSets = Math.max(...past.map(d => d.intensity), 1)
    const pastNorm: RailPastDay[] = past.map(d => ({ ...d, intensity: d.intensity / maxSets }))

    const future: RailFutureDay[] = []
    for (let i = 1; i <= FUTURE_DAYS; i++) {
      const d = addDays(today, i)
      const ymd = toYMD(d)
      future.push({ kind: 'future', label: DOW[d.getDay()], planned: planned.some(p => p.date === ymd) })
    }

    return [...pastNorm, { kind: 'today', label: 'Today' }, ...future]
  }, [sessions, planned, today])

  const weekStart = startOfWeek(today)
  const doneThisWeek = sessions.filter(s => new Date(s.startedAt) >= weekStart).length
  const weeklyTarget = nextSession?.sessionsPerWeek

  const discard = () => { clearDraft(); setDraft(null) }
  const resumeDraft = () => {
    if (!draft) return
    navigate('/session/new', draft.fogProgramId
      ? { state: { fogProgramId: draft.fogProgramId, method: draft.method } }
      : undefined)
  }
  const startNextSession = () => {
    if (!activeProgram || !nextSession) return
    navigate('/session/new', { state: buildClassStartState(activeProgram, nextSession) })
  }

  const draftCompletedSets = draft ? draft.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0) : 0
  const draftTotalSets = draft ? draft.exercises.reduce((n, e) => n + e.sets.length, 0) : 0

  // When the in-progress draft belongs to a class, look the program up directly
  // (rather than via activeProgram/findActiveProgramId) so the rich class card
  // still shows on a program's very first session — before it counts as
  // "active", which only happens once progress > 0 on finish.
  const draftClassProgram = draft?.fogProgramId ? FOG_PROGRAMS.find(p => p.id === draft.fogProgramId) ?? null : null
  const draftClassFlat = useMemo(() => draftClassProgram ? flattenFogProgram(draftClassProgram) : [], [draftClassProgram])
  const draftSessionIndex = draftClassProgram ? (programProgress[draftClassProgram.id] ?? 0) : 0
  const draftClassSession = draftClassFlat[draftSessionIndex]

  return (
    <div className="min-h-full flex flex-col bg-bg px-[18px] pt-safe">
      <div className="pt-[26px] pb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[11px] font-bold font-body text-faint uppercase tracking-wider mb-0.5">
              {draft ? 'In progress' : today.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <h1 className="font-display font-bold text-[22px] text-ink -tracking-wide">
              {draft
                ? (draftClassProgram ? draftClassProgram.name.replace(/ Program$/, '') : (draft.displayName ?? 'Free Training'))
                : (trainedToday ? 'Trained today' : activeProgram ? 'Next session' : 'Get started')}
            </h1>
          </div>
          {/* Always reachable, even mid-workout — Classes was previously only
              linkable from the empty state, so once a session (or a program)
              was under way there was no way back to browse other classes. */}
          <button
            onClick={() => navigate('/classes')}
            className="shrink-0 mt-0.5 px-3 py-1.5 rounded-control bg-elevated border border-line text-[11.5px] font-semibold text-muted hover:text-ink transition-colors"
          >
            Classes
          </button>
        </div>

        <Rail days={railDays} onSelect={() => navigate('/history')} />
        <p className="text-center text-[10.5px] text-faint mb-5">← scrub through your history and plan</p>

        {/* ── In-progress draft ─────────────────────────────────────────── */}
        {draft && (
          draftClassProgram && draftClassSession ? (
            <div className="bg-surface border border-line rounded-panel p-[18px] mb-3.5">
              <p className="text-[11px] font-bold font-body text-klass uppercase tracking-wider mb-2">
                Class · {draftClassProgram.name.replace(/ Program$/, '')}
              </p>
              <p className="font-mono font-bold text-[30px] text-ink leading-none mb-1">
                {draftSessionIndex + 1}/{draftClassFlat.length}
              </p>
              <p className="text-[14px] font-semibold text-ink mb-2.5">
                {draftClassSession.focus.split('/').join(' · ')} · {draftClassSession.method} · Week {draftClassSession.week}
              </p>
              <p className="text-[13px] text-muted mb-4">
                {draftCompletedSets}/{draftTotalSets} sets · {draft.exercises.length} exercise{draft.exercises.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button onClick={resumeDraft} className="flex-1 h-12 rounded-card bg-brand text-brand-ink font-bold text-[14.5px]">
                  Resume
                </button>
                <button onClick={discard} className="px-4 h-12 rounded-card border border-line text-muted text-[13px] font-semibold">
                  Discard
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-line rounded-panel p-[18px] mb-3.5">
              <p className="text-[15px] font-semibold text-ink mb-1">{draft.displayName ?? 'Free Training'}</p>
              <p className="text-[13px] text-muted mb-4">
                {draftCompletedSets}/{draftTotalSets} sets · {draft.exercises.length} exercise{draft.exercises.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button onClick={resumeDraft} className="flex-1 h-12 rounded-card bg-brand text-brand-ink font-bold text-[14.5px]">
                  Resume
                </button>
                <button onClick={discard} className="px-4 h-12 rounded-card border border-line text-muted text-[13px] font-semibold">
                  Discard
                </button>
              </div>
            </div>
          )
        )}

        {/* ── Active program: the reactive hero — hidden while a draft is in
            progress, since starting a new session here would silently orphan
            it (only one draft slot exists at a time). ──────────────────── */}
        {!draft && activeProgram && nextSession && (
          <div className="bg-surface border border-line rounded-panel p-[18px] mb-3.5">
            <p className="text-[11px] font-bold font-body text-klass uppercase tracking-wider mb-2">
              Class · {activeProgram.name.replace(/ Program$/, '')}
            </p>
            <p className="font-mono font-bold text-[30px] text-ink leading-none mb-1">
              {sessionIndex + 1}/{flat.length}
            </p>
            <p className="text-[14px] font-semibold text-ink mb-2.5">
              {nextSession.focus.split('/').join(' · ')} · {nextSession.method} · Week {nextSession.week}
            </p>
            <div className="flex flex-col gap-1.5 mb-3.5">
              {nextSession.exercises.slice(0, 5).map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-faint w-3.5">{i}</span>
                  <span className="text-[13px] text-muted truncate">{name}</span>
                </div>
              ))}
              {nextSession.exercises.length > 5 && (
                <p className="text-[11px] text-faint pl-[22px]">+{nextSession.exercises.length - 5} more</p>
              )}
            </div>
            <button onClick={startNextSession} className="w-full h-12 rounded-card bg-brand text-brand-ink font-bold text-[14.5px]">
              {trainedToday ? 'Start another session' : 'Start session'}
            </button>
          </div>
        )}

        {/* ── Nothing started yet ─────────────────────────────────────────── */}
        {!draft && !activeProgram && (
          <div className="bg-surface border border-line rounded-panel p-[18px] mb-3.5">
            <p className="text-[15px] font-semibold text-ink mb-1">Choose a program</p>
            <p className="text-[13px] text-muted mb-4">Structured classes with guided timers, or log a free session.</p>
            <button onClick={() => navigate('/classes')} className="w-full h-12 rounded-card bg-brand text-brand-ink font-bold text-[14.5px] mb-2">
              Browse Classes
            </button>
            <button onClick={() => navigate('/session/new')} className="w-full h-11 rounded-card border border-line text-ink font-semibold text-[13.5px]">
              Free training
            </button>
          </div>
        )}

        {weeklyTarget != null && (
          <p className="text-center text-[11.5px] text-faint">
            {doneThisWeek}/{weeklyTarget} this week
            {doneThisWeek >= weeklyTarget ? ' — week complete.' : ' — on pace.'}
          </p>
        )}

        {!draft && activeProgram && (
          <button onClick={() => navigate('/session/new')} className="mt-4 text-center text-[12px] text-faint font-semibold">
            or start free training →
          </button>
        )}
      </div>
    </div>
  )
}
