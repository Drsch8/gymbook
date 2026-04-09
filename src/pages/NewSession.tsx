import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ExerciseSearch } from '../components/ExerciseSearch'
import { ExerciseCard } from '../components/ExerciseCard'
import { RestTimer } from '../components/RestTimer'
import { getLastSessionForExercise, getPreferences, getSessions, saveSession, advancePlanSession, advanceFogProgram } from '../db'
import { nanoid } from '../utils/nanoid'
import { getPreset } from '../data/presets'
import { TRAINING_METHODS } from '../data/fogPrograms'
import { InfoPanel } from '../components/InfoPanel'
import { saveDraft, loadDraft, clearDraft } from '../utils/draft'
import type { Exercise, ExerciseSet, SessionExercise, WeightUnit } from '../types'
import type { PresetVariant } from '../data/presets'

const TITLE_CHIPS = ['Legs', 'Upper', 'Push', 'Pull', 'Core', 'Cardio', 'Full Body']


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

// ── Audio helpers ─────────────────────────────────────────────────────────────

function playDing(count: 1 | 3 = 1) {
  try {
    const ctx = new AudioContext()
    const schedule = count === 1 ? [0] : [0, 0.22, 0.44]
    schedule.forEach(offset => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0, ctx.currentTime + offset)
      gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + offset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.4)
      osc.start(ctx.currentTime + offset)
      osc.stop(ctx.currentTime + offset + 0.4)
    })
    setTimeout(() => ctx.close(), count === 1 ? 600 : 1200)
  } catch { /* silently ignore if AudioContext unavailable */ }
}

// ── Shared helpers for flat timers ────────────────────────────────────────────

function fmtFlat(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const TIMER_SIZE = { fontSize: 'min(28vw, 128px)', fontVariantNumeric: 'tabular-nums' } as const

function BigTime({ children, dim, blue }: { children: React.ReactNode; dim?: boolean; blue?: boolean }) {
  return (
    <span
      className={`font-black leading-none tabular-nums ${dim ? 'text-stone-600' : blue ? 'text-blue-400' : 'text-stone-100'}`}
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
      className="text-stone-400 hover:text-stone-200 transition-colors disabled:opacity-30 p-1.5"
      aria-label={running ? 'Pause' : 'Resume'}
    >
      {running ? (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="currentColor">
          <rect x="4" y="3" width="6" height="20" rx="2"/>
          <rect x="16" y="3" width="6" height="20" rx="2"/>
        </svg>
      ) : (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="currentColor">
          <polygon points="5,2 23,13 5,24"/>
        </svg>
      )}
    </button>
  )
}

function ProgressStrip({ progress, accent }: { progress: number; accent?: string }) {
  return (
    <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
      <div
        className={`h-1 rounded-full transition-all duration-[10ms] ${accent ?? 'bg-stone-400'}`}
        style={{ width: `${Math.min(progress, 1) * 100}%` }}
      />
    </div>
  )
}

// ── Stufenintervall flat timer ─────────────────────────────────────────────────

function FlatStufen({ running, onDone, onProgress }: { running: boolean; onDone: () => void; onProgress: (p: number) => void }) {
  const [seconds, setSeconds] = useState(450)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const done = seconds === 0
  const prevSecondsRef = useRef(450)

  useEffect(() => {
    onProgress(1 - seconds / 450)
    if (prevSecondsRef.current > 225 && seconds <= 225) playDing(1)
    prevSecondsRef.current = seconds
  }, [seconds, onProgress])

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 10)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds])

  useEffect(() => {
    if (!done) return
    onDoneRef.current()
  }, [done])

  const arrow = done ? null : seconds > 225 ? '↑' : '↓'

  return (
    <>
      <BigTime dim={done}>{done ? '0:00' : fmtFlat(seconds)}</BigTime>
      {arrow && (
        <p className={`text-4xl font-black mt-2 transition-colors ${seconds > 225 ? 'text-stone-300' : 'text-stone-500'}`}>
          {arrow}
        </p>
      )}
    </>
  )
}

// ── Intervallsätze flat timer ──────────────────────────────────────────────────

function FlatIntervall({ running, onResume, onDone, onProgress }: { running: boolean; onResume: () => void; onDone: () => void; onProgress: (p: number) => void }) {
  const [satz, setSatz] = useState(1)
  const [seconds, setSeconds] = useState(180)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const onResumeRef = useRef(onResume)
  onResumeRef.current = onResume
  const done = satz > 3

  useEffect(() => {
    onProgress(((satz - 1) * 180 + (180 - seconds)) / 540)
  }, [satz, seconds, onProgress])

  useEffect(() => {
    if (running && seconds > 0 && !done) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 10)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds, done])

  useEffect(() => {
    if (seconds !== 0 || done) return
    if (satz < 3) playDing(1)
    if (satz >= 3) { setSatz(4); return }
    const t = setTimeout(() => { setSatz(s => s + 1); setSeconds(180); onResumeRef.current() }, 800)
    return () => clearTimeout(t)
  }, [seconds]) // eslint-disable-line

  useEffect(() => {
    if (!done) return
    onDoneRef.current()
  }, [done])

  return (
    <>
      <BigTime dim={done}>{done ? '0:00' : fmtFlat(seconds)}</BigTime>
      {!done && <p className="text-xl font-semibold text-stone-500 mt-2">{`Satz ${satz} / 3`}</p>}
    </>
  )
}

// ── SuperPanel ─────────────────────────────────────────────────────────────────

function SuperPanel({ exercises, onClose, onComplete }: {
  exercises: SessionExercise[]
  onClose: () => void
  onComplete: () => void
}) {
  const BLOCK = 240 // 4 minutes per exercise block
  const numEx = exercises.length
  const totalBlocks = numEx * 2 // cycle twice: 1-2-3-1-2-3

  const [countdown, setCountdown] = useState(5)
  const [block, setBlock] = useState(0)
  const [seconds, setSeconds] = useState(BLOCK)
  const [running, setRunning] = useState(false)
  const [timerDone, setTimerDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ready = countdown === 0
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 10)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (ready && !timerDone) setRunning(true)
  }, [ready, timerDone])

  useEffect(() => {
    if (!timerDone) return
    playDing(3)
  }, [timerDone])

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 10)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds])

  useEffect(() => {
    if (seconds !== 0 || !ready || timerDone) return
    setRunning(false)
    if (block >= totalBlocks - 1) { setTimerDone(true); return }
    playDing(1)
    const t = setTimeout(() => { setBlock(b => b + 1); setSeconds(BLOCK); setRunning(true) }, 800)
    return () => clearTimeout(t)
  }, [seconds]) // eslint-disable-line

  const currentExIdx = block % numEx
  const round = Math.floor(block / numEx) + 1
  const progress = (block * BLOCK + (BLOCK - seconds)) / (totalBlocks * BLOCK)

  return (
    <div className="fixed inset-0 z-[100] bg-stone-950 flex flex-col select-none">
      {/* Quit */}
      <div className="flex items-center justify-end px-5 shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: 10 }}>
        <button onClick={onClose} className="text-stone-500 hover:text-stone-300 text-sm font-semibold transition-colors">
          Quit
        </button>
      </div>

      {/* Method label + separator */}
      <div className="px-5 pb-3 shrink-0 border-b border-stone-800">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">Supersätze</p>
      </div>

      {/* Exercise rows */}
      <div className="shrink-0 divide-y divide-stone-800/70">
        {exercises.map((item, i) => {
          const isActive = ready && !timerDone && i === currentExIdx
          return (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
              <span className="text-sm font-mono tabular-nums text-stone-600 w-5 shrink-0 text-right">{i + 1}</span>
              <p className={`text-2xl font-semibold leading-tight transition-colors ${isActive ? 'text-white' : 'text-stone-600'}`}>
                {item.exerciseName}
              </p>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
            </div>
          )
        })}
      </div>
      {ready && !timerDone && (
        <p className="px-5 pt-2 text-sm font-medium text-stone-600 shrink-0">Runde {round} / 2</p>
      )}

      {/* Timer — centered in remaining space */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <BigTime dim={timerDone}>{!ready ? `${countdown}s` : timerDone ? '0:00' : fmtFlat(seconds)}</BigTime>
      </div>

      {/* Controls */}
      <div className="shrink-0 px-5 space-y-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)', paddingTop: 8 }}>
        {timerDone ? (
          <button
            onClick={() => onCompleteRef.current()}
            className="w-full py-4 rounded-2xl text-lg font-bold bg-white text-stone-900 hover:bg-stone-100 transition-colors"
          >
            Fertig
          </button>
        ) : (
          <>
            {ready && (
              <div className="flex items-center">
                <PauseBtn running={running} onToggle={() => setRunning(r => !r)} />
              </div>
            )}
            {ready && <ProgressStrip progress={progress} />}
          </>
        )}
      </div>
    </div>
  )
}

// ── Hochintensität flat timer ──────────────────────────────────────────────────

function FlatHoch({ running, onPhaseChange, onDone, onProgress }: { running: boolean; onPhaseChange: (p: 'work' | 'rest') => void; onDone: () => void; onProgress: (p: number) => void }) {
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<'work' | 'rest'>('work')
  const [seconds, setSeconds] = useState(20)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const onPhaseChangeRef = useRef(onPhaseChange)
  onPhaseChangeRef.current = onPhaseChange

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
        if (phase === 'work') { setPhase('rest'); onPhaseChangeRef.current('rest'); playDing(1); return 10 }
        if (round >= 8) { setDone(true); return 0 }
        setRound(r => r + 1); setPhase('work'); onPhaseChangeRef.current('work'); playDing(1); return 20
      })
    }, 10)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, round, done])

  useEffect(() => {
    if (!done) return
    onDoneRef.current()
  }, [done])

  const isRest = phase === 'rest' && !done

  return (
    <>
      <BigTime dim={done} blue={isRest}>
        {done ? '0:00' : `0:${String(seconds).padStart(2, '0')}`}
      </BigTime>
      <p className="text-xl font-semibold text-stone-500 mt-2">
        {done ? 'Fertig ✓' : `Runde ${round} / 8`}
      </p>
      {!done && (
        <p className={`text-3xl font-black mt-1 ${isRest ? 'text-blue-400' : 'text-stone-200'}`}>
          {phase === 'work' ? 'Work Out!' : 'Pause'}
        </p>
      )}
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
  const [running, setRunning] = useState(false)
  const [timerDone, setTimerDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hochPhase, setHochPhase] = useState<'work' | 'rest'>('work')
  const ready = countdown === 0

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 10)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (ready) setRunning(true)
  }, [ready])

  const handleFinish = () => { onComplete(); onClose() }
  const handleFinishRef = useRef(handleFinish)
  handleFinishRef.current = handleFinish

  useEffect(() => {
    if (!timerDone) return
    playDing(3)
  }, [timerDone])

  // stable callback refs to avoid re-renders
  const onDoneStable = useRef(() => setTimerDone(true))
  const onProgressStable = useRef((p: number) => setProgress(p))

  const accent = method === 'Hochintensitätssätze'
    ? (hochPhase === 'rest' ? 'bg-blue-500' : 'bg-stone-100')
    : undefined

  return (
    <div className="fixed inset-0 z-[100] bg-stone-950 flex flex-col select-none">
      {/* Quit */}
      <div className="flex items-center justify-end px-5 shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: 10 }}>
        <button onClick={onClose} className="text-stone-500 hover:text-stone-300 text-sm font-semibold transition-colors">
          Quit
        </button>
      </div>

      {/* Method label + separator */}
      <div className="px-5 pb-3 shrink-0 border-b border-stone-800">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">{method}</p>
      </div>

      {/* Exercise row */}
      <div className="px-5 py-3.5 shrink-0 border-b border-stone-800/70">
        <p className="text-2xl font-semibold text-white">{exercise.exerciseName}</p>
      </div>

      {/* Timer — centered in remaining space */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {!ready ? (
          <BigTime>{countdown}s</BigTime>
        ) : method === 'Stufenintervalle' ? (
          <FlatStufen running={running} onDone={onDoneStable.current} onProgress={onProgressStable.current} />
        ) : method === 'Intervallsätze' ? (
          <FlatIntervall running={running} onResume={() => setRunning(true)} onDone={onDoneStable.current} onProgress={onProgressStable.current} />
        ) : method === 'Hochintensitätssätze' ? (
          <FlatHoch running={running} onPhaseChange={setHochPhase} onDone={onDoneStable.current} onProgress={onProgressStable.current} />
        ) : null}
      </div>

      {/* Controls */}
      <div className="shrink-0 px-5 space-y-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)', paddingTop: 8 }}>
        {timerDone ? (
          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-2xl text-lg font-bold bg-white text-stone-900 hover:bg-stone-100 transition-colors"
          >
            Fertig
          </button>
        ) : (
          <>
            {ready && (
              <div className="flex items-center">
                <PauseBtn running={running} onToggle={() => setRunning(r => !r)} />
              </div>
            )}
            {ready && <ProgressStrip progress={progress} accent={accent} />}
          </>
        )}
      </div>
    </div>
  )
}

// ── ZirkelPanel ────────────────────────────────────────────────────────────────

function ZirkelPanel({ exercises, onClose, onComplete }: {
  exercises: SessionExercise[]
  onClose: () => void
  onComplete: () => void
}) {
  const [countdown, setCountdown] = useState(5)
  const [seconds, setSeconds] = useState(1200)
  const [running, setRunning] = useState(false)
  const [timerDone, setTimerDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ready = countdown === 0
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 10)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (ready && !timerDone) setRunning(true)
  }, [ready, timerDone])

  useEffect(() => {
    if (!timerDone) return
    playDing(3)
  }, [timerDone])

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 10)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (seconds === 0) { setRunning(false); setTimerDone(true) }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds])

  const progress = 1 - seconds / 1200

  return (
    <div className="fixed inset-0 z-[100] bg-stone-950 flex flex-col select-none">
      {/* Quit row */}
      <div className="flex items-center justify-end px-5 shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: 8 }}>
        <button onClick={onClose} className="text-stone-500 hover:text-stone-300 text-sm font-semibold transition-colors">
          Quit
        </button>
      </div>

      {/* Method label + separator */}
      <div className="px-5 pb-3 shrink-0 border-b border-stone-800">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">Zirkelintervalle</p>
      </div>

      {/* Exercise rows */}
      <div className="shrink-0 divide-y divide-stone-800/70">
        {exercises.map((item, i) => (
          <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
            <span className="text-sm font-mono tabular-nums text-stone-600 w-5 shrink-0 text-right">{i + 1}</span>
            <p className="text-2xl font-semibold text-stone-300">{item.exerciseName}</p>
          </div>
        ))}
      </div>

      {/* Timer — centered in remaining space */}
      <div className="flex-1 flex items-center justify-center">
        <BigTime dim={timerDone}>{!ready ? `${countdown}s` : timerDone ? '0:00' : fmtFlat(seconds)}</BigTime>
      </div>

      {/* Controls */}
      <div className="shrink-0 px-5 space-y-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)', paddingTop: 8 }}>
        {timerDone ? (
          <button
            onClick={() => onCompleteRef.current()}
            className="w-full py-4 rounded-2xl text-lg font-bold bg-white text-stone-900 hover:bg-stone-100 transition-colors"
          >
            Fertig
          </button>
        ) : (
          <>
            {ready && (
              <div className="flex items-center">
                <PauseBtn running={running} onToggle={() => setRunning(r => !r)} />
              </div>
            )}
            {ready && <ProgressStrip progress={progress} />}
          </>
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
  // Load draft once on mount if it matches this session context
  const initialDraft = useMemo(() => {
    const d = loadDraft()
    return (d && d.fogProgramId === fogProgramId) ? d : null
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [exercises, setExercises] = useState<SessionExercise[]>(initialDraft?.exercises ?? repeated)
  const [sessionName] = useState(isClassSession ? (state?.name ?? '') : '')
  const [sessionTags, setSessionTags] = useState<string[]>(initialDraft?.sessionTags ?? state?.tags ?? [])
  const [previousSets, setPreviousSets] = useState<Record<string, ExerciseSet[]>>({})
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [restSeconds, setRestSeconds] = useState(90)
  const [showSearch, setShowSearch] = useState((initialDraft?.exercises ?? repeated).length === 0)
  const [lastCompleted, setLastCompleted] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>((initialDraft?.exercises ?? repeated)[0]?.id ?? null)
  const [variantOptions, setVariantOptions] = useState<PresetVariant[] | null>(null)
  const [chipCounts, setChipCounts] = useState<Record<string, number>>({})
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [showMethodInfo, setShowMethodInfo] = useState(false)
  const [showZirkelPanel, setShowZirkelPanel] = useState(false)
  const [showSuperPanel, setShowSuperPanel] = useState(false)
  const [circuitDone, setCircuitDone] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const startedAt = useRef(initialDraft?.startedAt ?? new Date().toISOString())
  const bottomRef = useRef<HTMLDivElement>(null)
  // Refs for reliable draft saving (always hold latest values)
  const exercisesRef = useRef(exercises)
  exercisesRef.current = exercises
  const sessionTagsRef = useRef(sessionTags)
  sessionTagsRef.current = sessionTags
  const finishingRef = useRef(finishing)
  finishingRef.current = finishing

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

  // Auto-save draft whenever exercises or tags change (not while finishing)
  useEffect(() => {
    if (exercises.length === 0 || finishing) return
    saveDraft({
      id: startedAt.current,
      exercises,
      sessionTags,
      startedAt: startedAt.current,
      fogProgramId,
      method: state?.method,
      displayName: (state?.name ?? sessionTags.join(' · ')) || undefined,
      locationState: state,
    })
  }, [exercises, sessionTags, finishing]) // eslint-disable-line react-hooks/exhaustive-deps

  // Also save on unmount in case the last change didn't flush
  useEffect(() => {
    return () => {
      if (exercisesRef.current.length === 0 || finishingRef.current) return
      saveDraft({
        id: startedAt.current,
        exercises: exercisesRef.current,
        sessionTags: sessionTagsRef.current,
        startedAt: startedAt.current,
        fogProgramId,
        method: state?.method,
        displayName: (state?.name ?? sessionTagsRef.current.join(' · ')) || undefined,
        locationState: state,
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addExercise = async (exercise: Exercise) => {
    setShowSearch(false)
    const prev = await getLastSessionForExercise(exercise.id)
    const prevSets = prev?.exercises.find(e => e.exerciseId === exercise.id)?.sets ?? []

    const makeSets = (n: number) => {
      const template = prevSets[prevSets.length - 1]
      return Array.from({ length: n }, () => ({
        id: nanoid(),
        completed: false,
        reps: template?.reps,
        weight: template?.weight,
        duration: template?.duration,
      }))
    }

    const item: SessionExercise = {
      id: nanoid(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      trackingType: exercise.trackingType,
      sets: makeSets(3),
    }

    setExercises(prev => [...prev, item])
    setExpandedId(item.id)
    if (prevSets.length > 0) setPreviousSets(p => ({ ...p, [item.id]: prevSets }))

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
    if (finishing) return
    setFinishing(true)
    try {
      const derivedName = sessionName.trim() || (sessionTags.length > 0 ? sessionTags.join(' · ') : undefined)
      const exercisesToSave = exercises.map(e => ({
        ...e,
        sets: e.sets.map(s => ({ ...s, completed: true })),
      }))
      await saveSession({
        id: nanoid(),
        name: derivedName,
        tags: sessionTags.length > 0 ? sessionTags : undefined,
        date: new Date().toISOString().slice(0, 10),
        startedAt: startedAt.current,
        finishedAt: new Date().toISOString(),
        exercises: exercisesToSave,
      })
      if (planSessionIndex !== undefined) await advancePlanSession()
      if (fogProgramId) await advanceFogProgram(fogProgramId)
    } catch (e) {
      console.error('Failed to save session', e)
    }
    clearDraft()
    window.dispatchEvent(new CustomEvent('wellDone'))
    navigate(fogProgramId ? '/classes' : '/', { replace: true })
  }

  const totalCompleted = exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0)
  const isZirkel = state?.method === 'Zirkelintervalle'
  const isSuper = state?.method === 'Supersätze'
  const allExercisesDone = (isZirkel || isSuper)
    ? circuitDone
    : exercises.length > 0 && exercises.every(e => e.sets.length > 0 && e.sets.every(s => s.completed))

  return (
    <div className="flex flex-col min-h-full bg-stone-50 dark:bg-stone-900">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-200 dark:border-stone-700 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors text-sm">
          ← Back
        </button>
        <span className="text-sm text-stone-400 dark:text-stone-500 font-mono">{totalCompleted}/{totalSets} sets</span>
        <div className="w-16" />
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
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100 pb-0.5 leading-tight min-h-7">
                {sessionTags.join(' · ')}
              </p>
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

        {(isZirkel || isSuper) ? (
          <>
            <div className="space-y-1.5 mb-2">
              {exercises.map((item, i) => (
                <div key={item.id} className="bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 shrink-0" />
                  <p className="text-sm text-stone-700 dark:text-stone-300">
                    {isSuper ? `${i + 1}. ` : ''}{item.exerciseName}
                  </p>
                </div>
              ))}
            </div>
            {isSuper && exercises.length > 0 && (
              <p className="text-xs text-stone-400 dark:text-stone-500 text-center pb-1">
                4 min pro Übung · 2 Runden · {exercises.length * 2} Blöcke
              </p>
            )}
            <button
              onClick={() => isSuper ? setShowSuperPanel(true) : setShowZirkelPanel(true)}
              className="w-full py-3 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-sm hover:bg-stone-800 dark:hover:bg-white active:scale-[0.98] transition-all"
            >
              Start Circuit
            </button>
          </>
        ) : null}

        {lastCompleted > 0 && !isClassSession && (
          <div className="flex justify-center py-1">
            <RestTimer key={lastCompleted} defaultSeconds={restSeconds} />
          </div>
        )}

        {isClassSession && !isZirkel && !isSuper ? exercises.map((item, i) => (
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

        {allExercisesDone && (
          <button
            onClick={finish}
            disabled={finishing}
            className="w-full py-4 rounded-2xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white active:scale-[0.98] disabled:opacity-50 text-white dark:text-stone-900 font-bold text-base transition-all"
          >
            Finish
          </button>
        )}

        <div className="h-24" />
      </div>

      {activeIdx !== null && exercises[activeIdx] && (
        <ClassExercisePanel
          exercise={exercises[activeIdx]}
          method={state?.method ?? ''}
          onClose={() => setActiveIdx(null)}
          onComplete={() => {
            completeExercise(activeIdx)
            if (activeIdx === exercises.length - 1) finish()
            else setActiveIdx(null)
          }}
        />
      )}

      {showZirkelPanel && (
        <ZirkelPanel
          exercises={exercises}
          onClose={() => setShowZirkelPanel(false)}
          onComplete={() => { setCircuitDone(true); finish() }}
        />
      )}

      {showSuperPanel && (
        <SuperPanel
          exercises={exercises}
          onClose={() => setShowSuperPanel(false)}
          onComplete={() => { setCircuitDone(true); finish() }}
        />
      )}

      {showMethodInfo && trainingMethod && (
        <InfoPanel title={trainingMethod.name} onClose={() => setShowMethodInfo(false)}>
          <div className="space-y-3">
            {trainingMethod.description.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">{para}</p>
            ))}
          </div>
        </InfoPanel>
      )}

    </div>
  )
}
