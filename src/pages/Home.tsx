import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPreferences } from '../db'
import { nanoid } from '../utils/nanoid'
import { FOG_PROGRAMS, flattenFogProgram, TRAINING_METHODS } from '../data/fogPrograms'
import type { FogProgram, FogFlatSession } from '../data/fogPrograms'
import type { SessionExercise } from '../types'

// ── Helpers ──────────────────────────────────────────────────────────────────

const FOCUS_TO_TAGS: Record<string, string[]> = {
  'Drücken': ['Push'],
  'Ziehen': ['Pull'],
  'Drücken/Ziehen': ['Push', 'Pull'],
  'Beine': ['Legs'],
  'Core': ['Core'],
  'Beine/Core': ['Legs', 'Core'],
  'Ganzkörper': ['Full Body'],
}

function makeExercises(session: FogFlatSession, programId: string): SessionExercise[] {
  const timerOnly = session.method === 'Stufenintervalle' || session.method === 'Hochintensitätssätze'
  const sets = timerOnly
    ? [{ id: nanoid(), completed: false }]
    : [
        { id: nanoid(), reps: 10, completed: false },
        { id: nanoid(), reps: 10, completed: false },
        { id: nanoid(), reps: 10, completed: false },
      ]
  return session.exercises.map(name => ({
    id: nanoid(),
    exerciseId: `fog_${programId}_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
    exerciseName: name,
    trackingType: 'reps_only' as const,
    sets: sets.map(s => ({ ...s, id: nanoid() })),
  }))
}

// ── Shared panel shell ────────────────────────────────────────────────────────

function Panel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const prevOverflow = useRef(document.body.style.overflow)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow.current }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white dark:bg-stone-800 rounded-2xl w-full max-w-lg h-[80vh] overflow-hidden flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-700 shrink-0">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

// ── Trainingsmethoden panel (global "?") ──────────────────────────────────────

function TrainingMethodsPanel({ onClose }: { onClose: () => void }) {
  return (
    <Panel title="Trainingsmethoden" onClose={onClose}>
      <div className="space-y-5">
        {TRAINING_METHODS.map(m => (
          <div key={m.name}>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">{m.name}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{m.description}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ── Program info panel (card title) – tabs: Programm / Voraussetzungen / Methoden ──

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
    { id: 'plan', label: 'Programm' },
    { id: 'requirements', label: 'Voraussetzungen' },
  ]

  return (
    <Panel title={program.name} onClose={onClose}>
      {/* Tab bar */}
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

      {/* Programm */}
      {tab === 'plan' && (
        <div className="space-y-6">
          {program.blocks.map(block => (
            <div key={block.weekLabel}>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">{block.weekLabel}</p>
                <span className="text-xs text-stone-400 dark:text-stone-500">{block.phase} · {block.sessionsPerWeek}×/Woche</span>
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
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Woche 7–10</p>
              <span className="text-xs text-stone-400 dark:text-stone-500">Wechselblock · 5×/Woche</span>
            </div>
            <div className="space-y-3">
              {program.wechsel.map(ww => (
                <div key={ww.week}>
                  <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1.5">Woche {ww.week}</p>
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
            </div>
          </div>
        </div>
      )}

      {/* Voraussetzungen */}
      {tab === 'requirements' && (
        <div>
          {program.requirements.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Jeder, der gesund genug für ein hartes Training ist, sollte das Basisprogramm absolvieren können.
              Bei Zweifeln konsultieren Sie bitte Ihren Arzt.
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

    </Panel>
  )
}

// ── Program Card ──────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  sessionIndex,
  onStart,
}: {
  program: FogProgram
  sessionIndex: number
  onStart: () => void
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
        {/* Header — clicking the label opens the program info panel */}
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
          <div className="px-4 py-5 text-center">
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {program.name} ✓
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Alle {total} Einheiten abgeschlossen!</p>
          </div>
        ) : (
          <div className="px-4 py-3">
            {/* Next session title — announcing what's coming */}
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight mb-1">
              {current ? (FOCUS_TO_TAGS[current.focus] ?? [current.focus]).join(' · ') : program.name}
            </p>

            {/* Current session info */}
            {current && (
              <div className="mt-1 mb-3">
                <p className="text-xs text-stone-400 dark:text-stone-500 mb-0.5">
                  Woche {current.week} · {current.phase} · Tag {current.day}
                </p>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                  {current.method}
                </p>
                {started && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
                    {current.sessionsPerWeek} Einheiten / Woche
                  </p>
                )}
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full bg-stone-100 dark:bg-stone-700 rounded-full h-1 mb-3">
              <div
                className="bg-stone-900 dark:bg-stone-300 h-1 rounded-full transition-all"
                style={{ width: `${(sessionIndex / total) * 100}%` }}
              />
            </div>

            <button
              onClick={onStart}
              className="w-full py-3 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white active:scale-[0.98] transition text-white dark:text-stone-900 font-semibold text-sm"
            >
              {started ? 'Weiter' : 'Starten'}
            </button>
          </div>
        )}
      </div>

      {showInfo && (
        <ProgramInfoPanel
          program={program}
          currentIndex={sessionIndex}
          onClose={() => setShowInfo(false)}
        />
      )}
    </>
  )
}

// ── Home page ─────────────────────────────────────────────────────────────────

export function Home() {
  const navigate = useNavigate()
  const [programProgress, setProgramProgress] = useState<Record<string, number>>({})
  const [showMethods, setShowMethods] = useState(false)

  useEffect(() => {
    getPreferences().then(p => setProgramProgress(p.programProgress ?? {}))
  }, [])

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
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">GymBook</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">Track your training. Own your progress.</p>
        </div>
        <button
          onClick={() => setShowMethods(true)}
          className="mt-2 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 flex items-center justify-center text-stone-500 dark:text-stone-400 font-bold transition-colors"
          aria-label="Trainingsmethoden"
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
        />
      ))}

      <Link
        to="/session/new"
        className="mb-8 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-sm font-medium hover:border-stone-400 dark:hover:border-stone-500 hover:text-stone-700 dark:hover:text-stone-200 bg-white dark:bg-stone-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Custom Workout
      </Link>

      {showMethods && <TrainingMethodsPanel onClose={() => setShowMethods(false)} />}
    </div>
  )
}
