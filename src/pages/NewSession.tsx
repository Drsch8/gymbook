import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ExerciseSearch } from '../components/ExerciseSearch'
import { ExerciseCard } from '../components/ExerciseCard'
import { RestTimer } from '../components/RestTimer'
import { getLastSessionForExercise, getPreferences, getSessions, saveSession, advancePlanSession, advanceFogProgram } from '../db'
import { nanoid } from '../utils/nanoid'
import { getPreset } from '../data/presets'
import { TRAINING_METHODS } from '../data/fogPrograms'
import { ZirkelTimer } from '../components/MethodTimer'
import type { Exercise, ExerciseSet, SessionExercise, WeightUnit } from '../types'
import type { PresetVariant } from '../data/presets'

const TITLE_CHIPS = ['Legs', 'Upper', 'Push', 'Pull', 'Core', 'Cardio', 'Full Body']

function newSessionExercise(exercise: Exercise): SessionExercise {
  return {
    id: nanoid(),
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    trackingType: exercise.trackingType,
    sets: [{ id: nanoid(), completed: false }],
  }
}

// ── Class session helpers ─────────────────────────────────────────────────────

function parsePair(name: string): { a: string; b: string } | null {
  const i = name.indexOf(' / ')
  if (i === -1) return null
  return { a: name.slice(0, i).trim(), b: name.slice(i + 3).trim() }
}

function ClassExerciseRow({ item, method, onStart }: {
  item: SessionExercise
  method: string
  onStart: () => void
}) {
  const done = item.sets.every(s => s.completed)
  const pair = method === 'Supersätze' ? parsePair(item.exerciseName) : null

  return (
    <div className={`bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 ${done ? 'opacity-60' : ''}`}>
      <div className="min-w-0">
        {pair ? (
          <>
            <p className={`text-sm font-semibold truncate ${done ? 'text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>{pair.a}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 truncate">/ {pair.b}</p>
          </>
        ) : (
          <p className={`text-sm font-semibold truncate ${done ? 'text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>{item.exerciseName}</p>
        )}
      </div>
      <button
        onClick={onStart}
        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
          done
            ? 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600'
            : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white'
        }`}
      >
        {done ? 'Bearbeiten' : 'Start'}
      </button>
    </div>
  )
}

// ── Shared helpers for flat timers ────────────────────────────────────────────

function fmtFlat(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const TIMER_SIZE = { fontSize: 'min(28vw, 128px)', fontVariantNumeric: 'tabular-nums' } as const

function BigTime({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <span
      className={`font-black leading-none tabular-nums ${dim ? 'text-stone-600' : 'text-stone-100'}`}
      style={TIMER_SIZE}
    >
      {children}
    </span>
  )
}

function PauseBtn({ running, onToggle, disabled }: { running: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="px-8 py-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-semibold transition-colors disabled:opacity-30"
    >
      {running ? '⏸ Pause' : '▶ Resume'}
    </button>
  )
}

function ProgressStrip({ progress, accent }: { progress: number; accent?: string }) {
  return (
    <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
      <div
        className={`h-1 rounded-full transition-all duration-1000 ${accent ?? 'bg-stone-400'}`}
        style={{ width: `${Math.min(progress, 1) * 100}%` }}
      />
    </div>
  )
}

// ── Stufenintervall flat timer ─────────────────────────────────────────────────

function FlatStufen({ onDone, onProgress }: { onDone: () => void; onProgress: (p: number) => void }) {
  const [seconds, setSeconds] = useState(450)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const done = seconds === 0

  useEffect(() => {
    onProgress(1 - seconds / 450)
  }, [seconds, onProgress])

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds])

  useEffect(() => {
    if (!done) return
    setRunning(false)
    const t = setTimeout(() => onDoneRef.current(), 800)
    return () => clearTimeout(t)
  }, [done])

  return (
    <>
      <BigTime dim={done}>{done ? '0:00' : fmtFlat(seconds)}</BigTime>
      <PauseBtn running={running} onToggle={() => setRunning(r => !r)} disabled={done} />
    </>
  )
}

// ── Intervallsätze flat timer ──────────────────────────────────────────────────

function FlatIntervall({ onDone, onProgress }: { onDone: () => void; onProgress: (p: number) => void }) {
  const [satz, setSatz] = useState(1)
  const [seconds, setSeconds] = useState(180)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const done = satz > 3

  useEffect(() => {
    onProgress(((satz - 1) * 180 + (180 - seconds)) / 540)
  }, [satz, seconds, onProgress])

  useEffect(() => {
    if (running && seconds > 0 && !done) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds, done])

  useEffect(() => {
    if (seconds !== 0 || done) return
    setRunning(false)
    const t = setTimeout(() => {
      if (satz >= 3) { setSatz(4) } else { setSatz(s => s + 1); setSeconds(180); setRunning(true) }
    }, 800)
    return () => clearTimeout(t)
  }, [seconds]) // eslint-disable-line

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => onDoneRef.current(), 800)
    return () => clearTimeout(t)
  }, [done])

  return (
    <>
      <BigTime dim={done}>{done ? '—' : fmtFlat(seconds)}</BigTime>
      <p className="text-xl font-semibold text-stone-500 mt-2">{done ? 'Fertig ✓' : `Satz ${satz} / 3`}</p>
      {!done && <PauseBtn running={running} onToggle={() => setRunning(r => !r)} disabled={seconds === 0} />}
    </>
  )
}

// ── Supersätze flat timer ──────────────────────────────────────────────────────

function FlatSuper({ onDone, onProgress }: { onDone: () => void; onProgress: (p: number) => void }) {
  const [count, setCount] = useState(1)
  const [seconds, setSeconds] = useState(240)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const done = count > 6
  const pair = Math.ceil(count / 2)
  const setInPair = ((count - 1) % 2) + 1

  useEffect(() => {
    onProgress(((count - 1) * 240 + (240 - seconds)) / 1440)
  }, [count, seconds, onProgress])

  useEffect(() => {
    if (running && seconds > 0 && !done) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds, done])

  useEffect(() => {
    if (seconds !== 0 || done) return
    setRunning(false)
    const t = setTimeout(() => {
      if (count >= 6) { setCount(7) } else { setCount(c => c + 1); setSeconds(240); setRunning(true) }
    }, 800)
    return () => clearTimeout(t)
  }, [seconds]) // eslint-disable-line

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => onDoneRef.current(), 800)
    return () => clearTimeout(t)
  }, [done])

  return (
    <>
      <BigTime dim={done}>{done ? '—' : fmtFlat(seconds)}</BigTime>
      <p className="text-xl font-semibold text-stone-500 mt-2">
        {done ? 'Fertig ✓' : `Paar ${pair} / 3 · Satz ${setInPair} / 2`}
      </p>
      {!done && <PauseBtn running={running} onToggle={() => setRunning(r => !r)} disabled={seconds === 0} />}
    </>
  )
}

// ── Hochintensität flat timer ──────────────────────────────────────────────────

function FlatHoch({ onDone, onProgress }: { onDone: () => void; onProgress: (p: number) => void }) {
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<'work' | 'rest'>('work')
  const [seconds, setSeconds] = useState(20)
  const [running, setRunning] = useState(true)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const totalSecs = 8 * 30
    const elapsed = (round - 1) * 30 + (phase === 'rest' ? 20 : 0) + (phase === 'work' ? 20 - seconds : 10 - seconds)
    onProgress(elapsed / totalSecs)
  }, [round, phase, seconds, onProgress])

  useEffect(() => {
    if (!running || done) return
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s > 1) return s - 1
        if (phase === 'work') { setPhase('rest'); return 10 }
        if (round >= 8) { setRunning(false); setDone(true); return 0 }
        setRound(r => r + 1); setPhase('work'); return 20
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, round, done])

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => onDoneRef.current(), 800)
    return () => clearTimeout(t)
  }, [done])

  const accent = done ? 'bg-stone-400' : phase === 'rest' ? 'bg-blue-500' : 'bg-stone-100'

  return (
    <>
      <BigTime dim={done}>
        {done ? '—' : `0:${String(seconds).padStart(2, '0')}`}
      </BigTime>
      <p className="text-xl font-semibold text-stone-500 mt-2">
        {done ? 'Fertig ✓' : `Runde ${round} / 8`}
      </p>
      {!done && (
        <p className={`text-sm font-bold uppercase tracking-[0.2em] ${phase === 'work' ? 'text-stone-300' : 'text-blue-400'}`}>
          {phase === 'work' ? 'Arbeit' : 'Pause'}
        </p>
      )}
      {!done && <PauseBtn running={running} onToggle={() => setRunning(r => !r)} />}
      <div className="w-full px-6">
        <ProgressStrip progress={((round - 1) * 30 + (phase === 'rest' ? 20 : 0) + (phase === 'work' ? 20 - seconds : 10 - seconds)) / 240} accent={accent} />
      </div>
    </>
  )
}

// ── ClassExercisePanel ─────────────────────────────────────────────────────────

function ClassExercisePanel({ exercise, method, onClose, onComplete }: {
  exercise: SessionExercise
  method: string
  onClose: () => void
  onComplete: () => void
}) {
  const [countdown, setCountdown] = useState(5)
  const [timerDone, setTimerDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const ready = countdown === 0
  const pair = method === 'Supersätze' ? parsePair(exercise.exerciseName) : null

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleFinish = () => { onComplete(); onClose() }

  // stable callback refs to avoid re-renders
  const onDoneStable = useRef(() => setTimerDone(true))
  const onProgressStable = useRef((p: number) => setProgress(p))

  return (
    <div className="fixed inset-0 z-[100] bg-stone-950 flex flex-col select-none">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)', paddingBottom: 12 }}>
        <div className="min-w-0 pr-4">
          <p className="text-sm font-medium text-stone-500 mb-1">{method}</p>
          {pair ? (
            <>
              <p className="text-2xl font-bold text-stone-100 leading-snug">{pair.a}</p>
              <p className="text-2xl font-bold text-stone-600 leading-snug">{pair.b}</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-stone-100 leading-snug">{exercise.exerciseName}</p>
          )}
        </div>
        <button onClick={onClose} className="shrink-0 text-stone-500 hover:text-stone-300 text-sm font-semibold transition-colors mt-1">
          Quit
        </button>
      </div>

      {/* ── Timer hero ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
        {!ready ? (
          <BigTime>{countdown}s</BigTime>
        ) : method === 'Stufenintervalle' ? (
          <FlatStufen onDone={onDoneStable.current} onProgress={onProgressStable.current} />
        ) : method === 'Intervallsätze' ? (
          <FlatIntervall onDone={onDoneStable.current} onProgress={onProgressStable.current} />
        ) : method === 'Supersätze' ? (
          <FlatSuper onDone={onDoneStable.current} onProgress={onProgressStable.current} />
        ) : method === 'Hochintensitätssätze' ? (
          <FlatHoch onDone={onDoneStable.current} onProgress={onProgressStable.current} />
        ) : null}
      </div>

      {/* ── Bottom ── */}
      <div className="shrink-0 px-5 space-y-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)' }}>
        {!ready && (
          <p className="text-center text-stone-500 text-sm font-medium">Get ready!</p>
        )}
        {ready && method !== 'Hochintensitätssätze' && (
          <ProgressStrip progress={progress} />
        )}
        {timerDone && (
          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-2xl bg-stone-100 hover:bg-white active:scale-[0.98] text-stone-900 font-bold text-base transition-all"
          >
            Finish ✓
          </button>
        )}
      </div>
    </div>
  )
}

export function NewSession() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { repeat?: SessionExercise[]; name?: string; tags?: string[]; method?: string; planSessionIndex?: number; fogProgramId?: string } | null
  const repeated = state?.repeat ?? []
  const planSessionIndex = state?.planSessionIndex
  const fogProgramId = state?.fogProgramId
  const isClassSession = !!(fogProgramId || planSessionIndex !== undefined)
  const trainingMethod = state?.method
    ? TRAINING_METHODS.find(m => m.shortName === state.method || m.name === state.method) ?? null
    : null
  const [exercises, setExercises] = useState<SessionExercise[]>(repeated)
  const [sessionName, setSessionName] = useState(isClassSession ? (state?.name ?? '') : '')
  const [sessionTags, setSessionTags] = useState<string[]>(state?.tags ?? [])
  const [previousSets, setPreviousSets] = useState<Record<string, ExerciseSet[]>>({})
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [restSeconds, setRestSeconds] = useState(90)
  const [showSearch, setShowSearch] = useState(repeated.length === 0)
  const [lastCompleted, setLastCompleted] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(repeated[0]?.id ?? null)
  const [variantOptions, setVariantOptions] = useState<PresetVariant[] | null>(null)
  const [chipCounts, setChipCounts] = useState<Record<string, number>>({})
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [showMethodInfo, setShowMethodInfo] = useState(false)
  const startedAt = useRef(new Date().toISOString())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPreferences().then(p => { setWeightUnit(p.weightUnit); setRestSeconds(p.restTimerDefault) })
  }, [])

  useEffect(() => {
    getSessions(500).then(sessions => {
      const counts: Record<string, number> = {}
      for (const s of sessions) {
        if (s.name && TITLE_CHIPS.includes(s.name)) {
          counts[s.name] = (counts[s.name] ?? 0) + 1
        }
      }
      setChipCounts(counts)
    })
  }, [])

  const addExercise = async (exercise: Exercise) => {
    const item = newSessionExercise(exercise)
    setExercises(prev => [...prev, item])
    setExpandedId(item.id) // collapse all others, open the new one
    setShowSearch(false)

    const prev = await getLastSessionForExercise(exercise.id)
    if (prev) {
      const prevEx = prev.exercises.find(e => e.exerciseId === exercise.id)
      if (prevEx) setPreviousSets(p => ({ ...p, [item.id]: prevEx.sets }))
    }

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
  }

  const updateExercise = (index: number, updated: SessionExercise) =>
    setExercises(prev => prev.map((e, i) => (i === index ? updated : e)))

  const completeExercise = (index: number) =>
    setExercises(prev => prev.map((e, i) =>
      i === index ? { ...e, sets: e.sets.map(s => ({ ...s, completed: true })) } : e
    ))

  const removeExercise = (index: number) => {
    const removed = exercises[index]
    setExercises(prev => prev.filter((_, i) => i !== index))
    if (removed.id === expandedId) setExpandedId(null)
    if (exercises.length <= 1) setShowSearch(true)
  }

  const finish = async () => {
    const derivedName = sessionName.trim() || (sessionTags.length > 0 ? sessionTags.join(' · ') : undefined)
    const exercisesToSave = isZirkel
      ? exercises.map(e => ({ ...e, sets: e.sets.map(s => ({ ...s, completed: true })) }))
      : exercises
    await saveSession({
      id: nanoid(),
      name: derivedName,
      tags: sessionTags.length > 0 ? sessionTags : undefined,
      date: new Date().toISOString().slice(0, 10),
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      exercises: exercisesToSave,
    })
    if (planSessionIndex !== undefined) {
      await advancePlanSession()
    }
    if (fogProgramId) {
      await advanceFogProgram(fogProgramId)
    }
    navigate('/', { replace: true })
  }

  const totalCompleted = exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0)
  const isZirkel = state?.method === 'Zirkelintervalle'
  const allExercisesDone = isZirkel
    ? exercises.length > 0
    : exercises.length > 0 && exercises.every(e => e.sets.length > 0 && e.sets.every(s => s.completed))

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-900">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-200 dark:border-stone-700 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors text-sm">
          ← Back
        </button>
        <span className="text-sm text-stone-400 dark:text-stone-500 font-mono">{totalCompleted}/{totalSets} sets</span>
        <button
          onClick={finish}
          disabled={exercises.length === 0 || (isClassSession && !allExercisesDone)}
          className="px-4 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-white dark:text-stone-900 text-sm font-semibold transition-colors"
        >
          Finish
        </button>
      </header>

      <div className="flex-1 px-4 py-5 space-y-3 max-w-lg mx-auto w-full">
        {/* Session title */}
        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 space-y-1.5">
          {isClassSession ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    {state?.method ?? 'Session'}
                  </p>
                  {sessionTags.length > 0 && (
                    <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">{sessionTags.join(' · ')}</p>
                  )}
                </div>
                {trainingMethod && (
                  <button
                    onClick={() => setShowMethodInfo(true)}
                    className="shrink-0 w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500 text-xs font-bold flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                  >
                    ?
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                placeholder="Session title (optional)"
                style={{ fontSize: '16px' }}
                className="w-full bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 font-semibold focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5">
                {TITLE_CHIPS.map(chip => {
                  const active = sessionTags.includes(chip)
                  return (
                    <button
                      key={chip}
                      onClick={() => {
                        if (active) {
                          setSessionTags(prev => prev.filter(t => t !== chip))
                          setVariantOptions(null)
                          if (exercises.length === 0 && sessionTags.length <= 1) setShowSearch(true)
                        } else {
                          setSessionTags(prev => [...prev, chip])
                          if (exercises.length === 0) {
                            const preset = getPreset(chip)
                            if (preset) {
                              setVariantOptions(preset.variants)
                              setShowSearch(false)
                            }
                          }
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        active
                          ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                          : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                      }`}
                    >
                      {chip}{chipCounts[chip] ? ` (${chipCounts[chip]})` : ''}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {variantOptions && (
          <div key={sessionTags.join(',')} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <p className="px-4 pt-3 pb-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">Choose a session</p>
            <div className="divide-y divide-stone-100">
              {variantOptions.map(variant => (
                <button
                  key={variant.name}
                  onClick={() => {
                    const items: SessionExercise[] = variant.exercises.map(ex => ({
                      id: nanoid(),
                      exerciseId: ex.exerciseId,
                      exerciseName: ex.exerciseName,
                      trackingType: ex.trackingType,
                      sets: ex.sets.map(s => ({ id: nanoid(), ...s, completed: false })),
                    }))
                    setExercises(items)
                    setExpandedId(items[0]?.id ?? null)
                    setShowSearch(false)
                    setVariantOptions(null)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-stone-900">{variant.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {variant.exercises.map(e => e.exerciseName).join(' · ')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {isZirkel ? (
          <>
            <ZirkelTimer />
            <div className="space-y-1.5">
              {exercises.map(item => (
                <div key={item.id} className="bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 shrink-0" />
                  <p className="text-sm text-stone-700 dark:text-stone-300">{item.exerciseName}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {lastCompleted > 0 && !isClassSession && (
          <div className="flex justify-center py-1">
            <RestTimer key={lastCompleted} defaultSeconds={restSeconds} />
          </div>
        )}

        {isClassSession && !isZirkel ? exercises.map((item, i) => (
          <ClassExerciseRow
            key={item.id}
            item={item}
            method={state?.method ?? ''}
            onStart={() => setActiveIdx(i)}
          />
        )) : !isClassSession ? exercises.map((item, i) => (
          <ExerciseCard
            key={item.id}
            item={item}
            weightUnit={weightUnit}
            previousSets={previousSets[item.id]}
            collapsed={item.id !== expandedId}
            onToggle={() => setExpandedId(prev => prev === item.id ? null : item.id)}
            onChange={updated => updateExercise(i, updated)}
            onRemove={() => removeExercise(i)}
            onSetCompleted={() => setLastCompleted(Date.now())}
          />
        )) : null}

        {!isClassSession && (showSearch ? (
          <div ref={bottomRef} className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
              {exercises.length === 0 ? 'Choose your first exercise' : 'Add exercise'}
            </p>
            <ExerciseSearch onSelect={addExercise} autoFocus />
          </div>
        ) : (
          <button
            onClick={() => {
              setShowSearch(true)
              setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
            }}
            className="w-full py-3 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-sm hover:border-stone-400 hover:text-stone-600 bg-white transition-colors"
          >
            + Add Exercise
          </button>
        ))}

        <div className="h-48" />
      </div>

      {activeIdx !== null && exercises[activeIdx] && (
        <ClassExercisePanel
          exercise={exercises[activeIdx]}
          method={state?.method ?? ''}
          onClose={() => setActiveIdx(null)}
          onComplete={() => completeExercise(activeIdx)}
        />
      )}

      {showMethodInfo && trainingMethod && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowMethodInfo(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white dark:bg-stone-800 rounded-2xl w-full max-w-lg h-[80vh] overflow-hidden flex flex-col shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-700 shrink-0">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">{trainingMethod.name}</h2>
              <button onClick={() => setShowMethodInfo(false)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">{trainingMethod.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
