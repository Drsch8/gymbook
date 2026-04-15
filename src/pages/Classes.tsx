import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InfoPanel } from '../components/InfoPanel'
import { usePreferences } from '../hooks/usePreferences'
import { nanoid } from '../utils/nanoid'
import { resetFogProgram } from '../db'
import { loadDraft } from '../utils/draft'
import { FOG_PROGRAMS, flattenFogProgram, TRAINING_METHODS } from '../data/fogPrograms'
import type { FogProgram, FogFlatSession } from '../data/fogPrograms'
import type { SessionExercise } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const FOCUS_TO_TAGS: Record<string, string[]> = {
  'Push': ['Push'],
  'Pull': ['Pull'],
  'Push/Pull': ['Push', 'Pull'],
  'Legs': ['Legs'],
  'Core': ['Core'],
  'Legs/Core': ['Legs', 'Core'],
  'Full Body': ['Full Body'],
}

function makeExercises(session: FogFlatSession, programId: string): SessionExercise[] {
  return session.exercises.map(name => ({
    id: nanoid(),
    exerciseId: `fog_${programId}_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
    exerciseName: name,
    trackingType: 'reps_only' as const,
    sets: [{ id: nanoid(), completed: false }],
  }))
}

// Panel is now InfoPanel from components

// ── Trainingsmethoden panel ───────────────────────────────────────────────────

function TrainingMethodsPanel({ onClose }: { onClose: () => void }) {
  return (
    <InfoPanel title="Training Methods" onClose={onClose}>
      <div className="space-y-5">
        {TRAINING_METHODS.map(m => (
          <div key={m.name}>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">{m.name}</p>
            <div className="space-y-2">
              {m.description.split('\n\n').map((para, i) => (
                <p key={i} className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </InfoPanel>
  )
}

// ── Program info panel ────────────────────────────────────────────────────────

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

  return (
    <InfoPanel title={program.name} onClose={onClose}>
      <div className="flex bg-stone-100 dark:bg-stone-700 rounded-xl p-1 gap-1 mb-4 -mx-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id
                ? 'bg-white dark:bg-stone-600 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
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
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">{block.weekLabel}</p>
                <span className="text-xs text-stone-400 dark:text-stone-500">{block.phase} · {block.sessionsPerWeek}×/week</span>
              </div>
              <div className="space-y-2">
                {block.days.map(day => {
                  const idx = flat.findIndex(s => s.week === block.weeks[0] && s.day === day.day)
                  const isDone = idx < currentIndex
                  const isCurrent = idx === currentIndex
                  return (
                    <div
                      key={day.day}
                      className={`rounded-xl px-3 py-2 border ${
                        isCurrent
                          ? 'border-stone-900 dark:border-stone-300 bg-stone-50 dark:bg-stone-700'
                          : isDone
                          ? 'border-stone-100 dark:border-stone-700 opacity-40'
                          : 'border-stone-100 dark:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide">
                          Tag {day.day} · {day.focus}
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">· {day.method}</span>
                        {isCurrent && (
                          <span className="ml-auto text-[10px] font-semibold text-stone-900 dark:text-stone-200">← aktuell</span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        {day.exercises.join(' · ')}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Weeks 7–10</p>
              <span className="text-xs text-stone-400 dark:text-stone-500">Alternating Block · 5×/week</span>
            </div>
            <div className="space-y-3">
              {program.wechsel.map(ww => (
                <div key={ww.week}>
                  <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1.5">Week {ww.week}</p>
                  <div className="space-y-1.5">
                    {ww.days.map(day => {
                      const idx = flat.findIndex(s => s.week === ww.week && s.day === day.day)
                      const isDone = idx < currentIndex
                      const isCurrent = idx === currentIndex
                      return (
                        <div
                          key={day.day}
                          className={`rounded-xl px-3 py-2 border ${
                            isCurrent
                              ? 'border-stone-900 dark:border-stone-300 bg-stone-50 dark:bg-stone-700'
                              : isDone
                              ? 'border-stone-100 dark:border-stone-700 opacity-40'
                              : 'border-stone-100 dark:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide">
                              Day {day.day} · {day.focus}
                            </span>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500">· {day.method}</span>
                            {isCurrent && (
                              <span className="ml-auto text-[10px] font-semibold text-stone-900 dark:text-stone-200">← current</span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            {day.exercises.join(' · ')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'requirements' && (
        <div>
          {program.requirements.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Anyone healthy enough for intense exercise should be able to complete this program.
              If in doubt, consult your doctor.
            </p>
          ) : (
            <div className="space-y-5">
              {program.requirements.map(r => (
                <div key={r.category}>
                  <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">{r.category}</p>
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </InfoPanel>
  )
}

// ── Program Card ──────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  sessionIndex,
  onStart,
  onRedo,
  blocked,
  hasDraft,
}: {
  program: FogProgram
  sessionIndex: number
  onStart: () => void
  onRedo: () => void
  blocked?: boolean
  hasDraft?: boolean
}) {
  const [showInfo, setShowInfo] = useState(false)
  const flat = flattenFogProgram(program)
  const total = flat.length
  const done = sessionIndex >= total
  const current = done ? null : flat[sessionIndex]
  const started = sessionIndex > 0

  return (
    <>
      <div className="mb-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden">
        <div className="px-4 pt-3 pb-2 border-b border-stone-100 dark:border-stone-700 flex items-center justify-between">
          <button
            onClick={() => setShowInfo(true)}
            className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            {program.name} ›
          </button>
          {!done && (
            <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">{sessionIndex} / {total}</span>
          )}
        </div>

        {done ? (
          <div className="px-4 py-4 text-center space-y-3">
            <div>
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{program.name} ✓</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">All {total} sessions completed!</p>
            </div>
            <button
              onClick={onRedo}
              className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
            >
              Start over
            </button>
          </div>
        ) : (
          <div className="px-4 py-3">
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight mb-1">
              {current ? (FOCUS_TO_TAGS[current.focus] ?? [current.focus]).join(' · ') : program.name}
            </p>
            {current && (
              <div className="mt-1 mb-3">
                <p className="text-xs text-stone-400 dark:text-stone-500 mb-0.5">
                  Week {current.week} · {current.phase} · Day {current.day}
                </p>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{current.method}</p>
                {started && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
                    {current.sessionsPerWeek} sessions / week
                  </p>
                )}
              </div>
            )}
            <div className="w-full bg-stone-100 dark:bg-stone-700 rounded-full h-1 mb-3">
              <div
                className="bg-stone-900 dark:bg-stone-300 h-1 rounded-full transition-all"
                style={{ width: `${(sessionIndex / total) * 100}%` }}
              />
            </div>
            <button
              onClick={blocked ? undefined : onStart}
              disabled={blocked}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
                blocked
                  ? 'bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                  : 'bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white active:scale-[0.98] text-white dark:text-stone-900'
              }`}
            >
              {hasDraft ? 'Continue' : 'Start'}
            </button>
          </div>
        )}
      </div>

      {showInfo && (
        <ProgramInfoPanel program={program} currentIndex={sessionIndex} onClose={() => setShowInfo(false)} />
      )}
    </>
  )
}

// ── Dev method cards ──────────────────────────────────────────────────────────

const DEV_METHOD_SESSIONS: { method: string; exercises: string[] }[] = [
  { method: 'Step Intervals',      exercises: ['Push-Up', 'Squat', 'Pull-Up'] },
  { method: 'Interval Sets',       exercises: ['Lunge', 'Door Row', 'Leg Raise'] },
  { method: 'Supersets',           exercises: ['Push-Up (feet elevated) / Explosive Push-Up', 'Military Press / Thumbs Up', 'Close-Grip Push-Up / Tricep Dip with chair'] },
  { method: 'Circuits',            exercises: ['Push-Up', 'Squat', 'Leg Raise', 'Door Row'] },
  { method: 'High Intensity Sets', exercises: ['Squat', 'Push-Up'] },
]

// DEV: remove export + rename to DevMethodCards and uncomment usage below to re-enable
export function DevMethodCards() {
  const navigate = useNavigate()

  function start(method: string, exerciseNames: string[]) {
    const exercises: SessionExercise[] = exerciseNames.map(name => ({
      id: nanoid(),
      exerciseId: `dev_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
      exerciseName: name,
      trackingType: 'reps_only' as const,
      sets: [{ id: nanoid(), completed: false }],
    }))
    navigate('/session/new', {
      state: { fogProgramId: 'dev', name: method, tags: [], method, repeat: exercises },
    })
  }

  return (
    <div className="mb-4">
      <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mb-2">Dev — Methoden-Test</p>
      <div className="space-y-2">
        {DEV_METHOD_SESSIONS.map(({ method, exercises }) => (
          <button
            key={method}
            onClick={() => start(method, exercises)}
            className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{method}</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{exercises.join(' · ')}</p>
            </div>
            <svg className="w-4 h-4 text-stone-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Classes page ──────────────────────────────────────────────────────────────

export function Classes() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const programProgress = prefs.programProgress ?? {}
  const [showMethods, setShowMethods] = useState(false)

  // Determine if a class session is in progress (has at least one completed set)
  const activeDraftProgramId = (() => {
    const d = loadDraft()
    if (!d?.fogProgramId) return null
    const hasProgress = d.exercises.some(e => e.sets.some(s => s.completed))
    return hasProgress ? d.fogProgramId : null
  })()

  function getIndex(programId: string) {
    return programProgress[programId] ?? 0
  }

  function handleStart(program: FogProgram) {
    const flat = flattenFogProgram(program)
    const index = getIndex(program.id)
    if (index >= flat.length) return
    const session = flat[index]
    const exercises = makeExercises(session, program.id)
    const tags = FOCUS_TO_TAGS[session.focus] ?? [session.focus]
    navigate('/session/new', {
      state: {
        fogProgramId: program.id,
        name: tags.join(' · '),
        tags,
        method: session.method,
        repeat: exercises,
      },
    })
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-safe">
      <div className="pt-14 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Classes</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">Structured programs</p>
        </div>
        <button
          onClick={() => setShowMethods(true)}
          className="mt-2 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 flex items-center justify-center text-stone-500 dark:text-stone-400 font-bold transition-colors"
          aria-label="Training methods"
        >
          ?
        </button>
      </div>

      {FOG_PROGRAMS.map(program => (
        <ProgramCard
          key={program.id}
          program={program}
          sessionIndex={getIndex(program.id)}
          onStart={() => handleStart(program)}
          onRedo={() => resetFogProgram(program.id)}
          blocked={activeDraftProgramId !== null && activeDraftProgramId !== program.id}
          hasDraft={activeDraftProgramId === program.id}
        />
      ))}

      {/* DEV — uncomment to test training methods
      <DevMethodCards />
      */}

      {showMethods && <TrainingMethodsPanel onClose={() => setShowMethods(false)} />}
    </div>
  )
}
