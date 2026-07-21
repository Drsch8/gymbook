import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InfoPanel } from '../components/InfoPanel'
import { usePreferences } from '../hooks/usePreferences'
import { resetFogProgram } from '../db'
import { loadDraft } from '../utils/draft'
import { buildClassStartState, findActiveProgramId } from '../utils/classSession'
import { FOG_PROGRAMS, flattenFogProgram, TRAINING_METHODS } from '../data/fogPrograms'
import type { FogProgram } from '../data/fogPrograms'

// ── Training methods panel ────────────────────────────────────────────────────

function TrainingMethodsPanel({ onClose }: { onClose: () => void }) {
  return (
    <InfoPanel title="Training Methods" onClose={onClose}>
      <div className="space-y-5">
        {TRAINING_METHODS.map(m => (
          <div key={m.name}>
            <p className="text-sm font-semibold font-display text-ink mb-1">{m.name}</p>
            <div className="space-y-2">
              {m.description.split('\n\n').map((para, i) => (
                <p key={i} className="text-xs text-muted leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </InfoPanel>
  )
}

// ── Program info panel (week-by-week drill-down) ──────────────────────────────

type ProgramTab = 'plan' | 'requirements'

function ProgramInfoPanel({
  program,
  currentIndex,
  onClose,
}: {
  program: FogProgram
  currentIndex: number
  onClose: () => void
}) {
  const [tab, setTab] = useState<ProgramTab>('plan')
  const flat = flattenFogProgram(program)

  const tabs: { id: ProgramTab; label: string }[] = [
    { id: 'plan', label: 'Program' },
    { id: 'requirements', label: 'Requirements' },
  ]

  const dayRow = (day: { day: number; focus: string; method: string; exercises: string[] }, week: number) => {
    const idx = flat.findIndex(s => s.week === week && s.day === day.day)
    const isDone = idx < currentIndex
    const isCurrent = idx === currentIndex
    return (
      <div
        key={`${week}-${day.day}`}
        className={`rounded-card px-3 py-2 border ${isCurrent ? 'border-pr bg-elevated' : 'border-line'} ${isDone ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center gap-1.5 mb-1">
          {isDone && <span className="text-[10px] font-bold text-done">✓</span>}
          <span className="text-[10px] font-bold font-body text-faint uppercase tracking-wide">
            Day {day.day} · {day.focus}
          </span>
          <span className="text-[10px] text-faint">· {day.method}</span>
          {isCurrent && <span className="ml-auto text-[10px] font-bold text-pr">← current</span>}
        </div>
        <p className="text-xs text-muted leading-relaxed">{day.exercises.join(' · ')}</p>
      </div>
    )
  }

  return (
    <InfoPanel title={program.name} onClose={onClose}>
      <div className="flex bg-elevated rounded-card p-1 gap-1 mb-4 -mx-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 rounded-control text-xs font-semibold transition-colors ${
              tab === t.id ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'plan' && (
        <div className="space-y-6">
          {program.blocks.map(block => (
            <div key={block.weekLabel}>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-xs font-bold font-display text-ink">{block.weekLabel}</p>
                <span className="text-xs text-faint">{block.phase} · {block.sessionsPerWeek}×/week</span>
              </div>
              <div className="space-y-2">
                {block.weeks.map(week => block.days.map(day => dayRow(day, week)))}
              </div>
            </div>
          ))}

          {program.wechsel.length > 0 && (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-xs font-bold font-display text-ink">Alternating block</p>
                <span className="text-xs text-faint">5×/week</span>
              </div>
              <div className="space-y-3">
                {program.wechsel.map(ww => (
                  <div key={ww.week}>
                    <p className="text-[11px] font-bold text-muted mb-1.5">Week {ww.week}</p>
                    <div className="space-y-1.5">{ww.days.map(day => dayRow(day, ww.week))}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'requirements' && (
        <div>
          {program.requirements.length === 0 ? (
            <p className="text-sm text-muted leading-relaxed">
              Anyone healthy enough for intense exercise should be able to complete this program.
              If in doubt, consult your doctor.
            </p>
          ) : (
            <div className="space-y-5">
              {program.requirements.map(r => (
                <div key={r.category}>
                  <p className="text-xs font-bold text-faint uppercase tracking-wider mb-1">{r.category}</p>
                  <p className="text-sm text-ink leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </InfoPanel>
  )
}

// ── Program arc — 44 sessions grouped by week-block, coloured by progress ────

interface ArcRow { label: string; phase: string; startIdx: number; count: number }

function getArcRows(program: FogProgram): ArcRow[] {
  const rows: ArcRow[] = []
  let offset = 0
  for (const block of program.blocks) {
    const count = block.weeks.length * block.days.length
    const last = block.weeks[block.weeks.length - 1]
    rows.push({ label: block.weeks.length > 1 ? `Wk ${block.weeks[0]}–${last}` : `Wk ${block.weeks[0]}`, phase: block.phase, startIdx: offset, count })
    offset += count
  }
  if (program.wechsel.length > 0) {
    const count = program.wechsel.reduce((n, ww) => n + ww.days.length, 0)
    const weeks = program.wechsel.map(w => w.week)
    rows.push({ label: `Wk ${weeks[0]}–${weeks[weeks.length - 1]}`, phase: 'Alternating', startIdx: offset, count })
  }
  return rows
}

function ProgramArc({ program, sessionIndex }: { program: FogProgram; sessionIndex: number }) {
  const rows = useMemo(() => getArcRows(program), [program])
  const total = useMemo(() => flattenFogProgram(program).length, [program])

  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold font-body text-faint uppercase tracking-wider mb-3">
        Program arc — {total} sessions
      </p>
      <div className="space-y-3">
        {rows.map(row => (
          <div key={row.label}>
            <div className="flex items-baseline gap-2 mb-1.5">
              <p className="text-[13px] font-bold font-display text-ink">{row.label}</p>
              <span className="text-[11px] text-faint">{row.phase}</span>
            </div>
            <div className="flex flex-wrap gap-[3px]">
              {Array.from({ length: row.count }, (_, i) => row.startIdx + i).map(idx => (
                <div
                  key={idx}
                  className={`h-4 flex-1 min-w-[10px] rounded-[3px] ${
                    idx < sessionIndex ? 'bg-done' : idx === sessionIndex ? 'bg-pr' : 'bg-elevated border border-line'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Active program hero (the "My program" tab) ────────────────────────────────

function ActiveProgramCard({
  program,
  sessionIndex,
  onStart,
  onOpenInfo,
  blocked,
  hasDraft,
}: {
  program: FogProgram
  sessionIndex: number
  onStart: () => void
  onOpenInfo: () => void
  blocked?: boolean
  hasDraft?: boolean
}) {
  const flat = flattenFogProgram(program)
  const total = flat.length
  const done = sessionIndex >= total
  const current = done ? null : flat[sessionIndex]

  if (done) {
    return (
      <div className="bg-surface border border-line rounded-panel px-[18px] py-5 text-center mb-4">
        <p className="text-lg font-bold font-display text-ink">{program.name} ✓</p>
        <p className="text-xs text-faint mt-1 mb-4">All {total} sessions completed!</p>
        <button onClick={() => resetFogProgram(program.id)} className="w-full h-11 rounded-card border border-line text-muted text-sm font-semibold">
          Start over
        </button>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-line rounded-panel p-[18px] mb-4">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onOpenInfo} className="text-[11px] font-bold font-body text-klass uppercase tracking-wider">
          {program.name.replace(/ Program$/, '')} ›
        </button>
        <span className="font-mono text-[13px] text-faint">{sessionIndex}/{total}</span>
      </div>
      {current && (
        <>
          <p className="text-[15px] font-semibold font-display text-ink mb-3">
            {current.focus.split('/').join(' · ')} · {current.method}
          </p>
          <div className="flex flex-col gap-1.5 mb-4">
            {current.exercises.slice(0, 6).map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-faint w-3.5">{i}</span>
                <span className="text-[13px] text-muted truncate">{name}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-1 bg-elevated rounded-full mb-4">
            <div className="h-1 bg-klass rounded-full transition-all" style={{ width: `${(sessionIndex / total) * 100}%` }} />
          </div>
        </>
      )}
      <button
        onClick={blocked ? undefined : onStart}
        disabled={blocked}
        className={`w-full h-12 rounded-card font-bold text-[14.5px] transition ${
          blocked ? 'bg-elevated text-faint cursor-not-allowed' : 'bg-ink text-bg'
        }`}
      >
        {hasDraft ? 'Continue' : 'Start'}
      </button>
    </div>
  )
}

// ── Compact program card ("All programs" tab) ─────────────────────────────────

function CompactProgramCard({
  program,
  sessionIndex,
  onStart,
  onOpenInfo,
  blocked,
  hasDraft,
}: {
  program: FogProgram
  sessionIndex: number
  onStart: () => void
  onOpenInfo: () => void
  blocked?: boolean
  hasDraft?: boolean
}) {
  const total = flattenFogProgram(program).length
  const done = sessionIndex >= total

  return (
    <div className="bg-surface border border-line rounded-panel px-4 py-3.5 mb-3 flex items-center justify-between gap-3">
      <button onClick={onOpenInfo} className="min-w-0 text-left">
        <p className="text-[14px] font-semibold font-display text-ink truncate">{program.name}</p>
        <p className="text-[11.5px] text-faint font-mono mt-0.5">{done ? `${total}/${total} ✓` : `${sessionIndex}/${total}`}</p>
      </button>
      <button
        onClick={blocked ? undefined : onStart}
        disabled={blocked}
        className={`shrink-0 px-4 py-2 rounded-control text-[13px] font-bold transition ${
          blocked ? 'bg-elevated text-faint cursor-not-allowed' : done ? 'border border-line text-muted' : 'bg-ink text-bg'
        }`}
      >
        {done ? 'Restart' : hasDraft ? 'Continue' : 'Start'}
      </button>
    </div>
  )
}

// ── Classes page ──────────────────────────────────────────────────────────────

type Tab = 'mine' | 'all'

export function Classes() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const programProgress = prefs.programProgress ?? {}
  const [showMethods, setShowMethods] = useState(false)
  const [infoProgram, setInfoProgram] = useState<FogProgram | null>(null)
  const [tab, setTab] = useState<Tab>('mine')

  const activeDraftProgramId = (() => {
    const d = loadDraft()
    if (!d?.fogProgramId) return null
    const hasProgress = d.exercises.some(e => e.sets.some(s => s.completed))
    return hasProgress ? d.fogProgramId : null
  })()

  function getIndex(programId: string) {
    return programProgress[programId] ?? 0
  }

  const activeProgramId = useMemo(() => {
    if (activeDraftProgramId) return activeDraftProgramId
    return findActiveProgramId(FOG_PROGRAMS, programProgress, flattenFogProgram)
  }, [activeDraftProgramId, programProgress])
  const activeProgram = FOG_PROGRAMS.find(p => p.id === activeProgramId) ?? null

  function handleStart(program: FogProgram) {
    const flat = flattenFogProgram(program)
    const index = getIndex(program.id)
    if (index >= flat.length) return
    navigate('/session/new', { state: buildClassStartState(program, flat[index]) })
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg px-[18px] pt-safe">
      <div className="pt-[26px] pb-5 flex items-start justify-between">
        <h1 className="font-display font-bold text-[26px] text-ink -tracking-wide">Classes</h1>
        <button onClick={() => setShowMethods(true)} className="text-[13px] font-semibold text-klass">
          ? Methods
        </button>
      </div>

      <div className="flex bg-elevated rounded-card p-1 gap-1 mb-4">
        <button
          onClick={() => setTab('mine')}
          className={`flex-1 py-1.5 rounded-control text-[13px] font-semibold transition-colors ${tab === 'mine' ? 'bg-surface text-ink' : 'text-muted'}`}
        >
          My program
        </button>
        <button
          onClick={() => setTab('all')}
          className={`flex-1 py-1.5 rounded-control text-[13px] font-semibold transition-colors ${tab === 'all' ? 'bg-surface text-ink' : 'text-muted'}`}
        >
          All programs
        </button>
      </div>

      {tab === 'mine' && (
        activeProgram ? (
          <>
            <ActiveProgramCard
              program={activeProgram}
              sessionIndex={getIndex(activeProgram.id)}
              onStart={() => handleStart(activeProgram)}
              onOpenInfo={() => setInfoProgram(activeProgram)}
              blocked={activeDraftProgramId !== null && activeDraftProgramId !== activeProgram.id}
              hasDraft={activeDraftProgramId === activeProgram.id}
            />
            <ProgramArc program={activeProgram} sessionIndex={getIndex(activeProgram.id)} />
          </>
        ) : (
          <div className="bg-surface border border-line rounded-panel px-[18px] py-6 text-center mb-4">
            <p className="text-[15px] font-semibold font-display text-ink mb-1">No program yet</p>
            <p className="text-[13px] text-muted mb-4">Pick one from All Programs to get started.</p>
            <button onClick={() => setTab('all')} className="w-full h-11 rounded-card bg-brand text-brand-ink font-bold text-[13.5px]">
              Browse programs
            </button>
          </div>
        )
      )}

      {tab === 'all' && FOG_PROGRAMS.map(program => (
        <CompactProgramCard
          key={program.id}
          program={program}
          sessionIndex={getIndex(program.id)}
          onStart={() => handleStart(program)}
          onOpenInfo={() => setInfoProgram(program)}
          blocked={activeDraftProgramId !== null && activeDraftProgramId !== program.id}
          hasDraft={activeDraftProgramId === program.id}
        />
      ))}

      <div className="h-8" />

      {infoProgram && (
        <ProgramInfoPanel program={infoProgram} currentIndex={getIndex(infoProgram.id)} onClose={() => setInfoProgram(null)} />
      )}
      {showMethods && <TrainingMethodsPanel onClose={() => setShowMethods(false)} />}
    </div>
  )
}
