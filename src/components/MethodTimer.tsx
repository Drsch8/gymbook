import { useEffect, useRef, useState } from 'react'

interface Props {
  method: string
  autoStart?: boolean
  onDone?: () => void
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const BOX = 'w-36 h-28 rounded-3xl bg-stone-100 dark:bg-stone-800'
const BOX_NUM = 'text-5xl font-bold font-mono leading-none tabular-nums'

function DisplayBox({ children, label, colorClass = 'text-stone-900 dark:text-stone-100' }: {
  children: React.ReactNode
  label?: string
  colorClass?: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs leading-none invisible">▲</span>
      <div className={`flex items-center justify-center ${BOX}`}>
        <span className={`${BOX_NUM} ${colorClass}`}>{children}</span>
      </div>
      <span className="text-xs leading-none invisible">▼</span>
      {label && <span className="text-xs text-stone-400 dark:text-stone-500 mt-1">{label}</span>}
    </div>
  )
}

// ── Stufenintervall (pyramid, 7.5 min per exercise) ───────────────────────────

function StufenintervallTimer({ autoStart, onDone }: { autoStart?: boolean; onDone?: () => void }) {
  const [seconds, setSeconds] = useState(450)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const done = seconds === 0

  useEffect(() => { if (autoStart) setRunning(true) }, []) // eslint-disable-line

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
    const t = setTimeout(() => onDoneRef.current?.(), 1500)
    return () => clearTimeout(t)
  }, [done])

  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-4 space-y-3">
      <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Stufenintervall</span>

      <div className="flex items-start justify-center py-1">
        <DisplayBox label="Zeit" colorClass={done ? 'text-red-500' : 'text-stone-900 dark:text-stone-100'}>
          {done ? '0:00' : fmt(seconds)}
        </DisplayBox>
      </div>

      <button
        onClick={() => setRunning(r => !r)}
        disabled={done}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-30 transition-colors"
      >
        {running ? '⏸ Pause' : '▶ Start'}
      </button>

      {done && (
        <button
          onClick={() => { setSeconds(450); setRunning(false) }}
          className="w-full py-1.5 rounded-xl text-xs text-stone-400 dark:text-stone-500 border border-dashed border-stone-200 dark:border-stone-700 hover:border-stone-400 transition-colors"
        >
          Neu starten
        </button>
      )}
    </div>
  )
}

// ── Intervallsatz (3 × 3 min, auto-advance) ───────────────────────────────────

function IntervallsätzeTimer({ autoStart, onDone }: { autoStart?: boolean; onDone?: () => void }) {
  const [satz, setSatz] = useState(1)
  const [seconds, setSeconds] = useState(180)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const done = satz > 3

  useEffect(() => { if (autoStart) setRunning(true) }, []) // eslint-disable-line

  useEffect(() => {
    if (running && seconds > 0 && !done) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds, done])

  // Auto-advance when interval ends
  useEffect(() => {
    if (seconds !== 0 || done) return
    setRunning(false)
    const t = setTimeout(() => {
      if (satz >= 3) {
        setSatz(4)
      } else {
        setSatz(s => s + 1)
        setSeconds(180)
        setRunning(true)
      }
    }, 800)
    return () => clearTimeout(t)
  }, [seconds]) // eslint-disable-line

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => onDoneRef.current?.(), 1500)
    return () => clearTimeout(t)
  }, [done])

  const nextSatz = () => {
    if (satz >= 3) { setSatz(4) } else { setSatz(s => s + 1); setSeconds(180); setRunning(true) }
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-4 space-y-3">
      <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
        {done ? 'Intervallsätze fertig ✓' : `Intervallsatz ${satz}/3`}
      </span>

      {!done && (
        <>
          <div className="flex items-start justify-center gap-3 py-1">
            <DisplayBox label="Zeit" colorClass={seconds === 0 ? 'text-red-500' : 'text-stone-900 dark:text-stone-100'}>
              {fmt(seconds)}
            </DisplayBox>
            <DisplayBox label="Satz">{satz}</DisplayBox>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRunning(r => !r)}
              disabled={seconds === 0}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-30 transition-colors"
            >
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button
              onClick={nextSatz}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
            >
              {satz < 3 ? 'Nächster →' : 'Fertig ✓'}
            </button>
          </div>
        </>
      )}

      {done && (
        <button
          onClick={() => { setSatz(1); setSeconds(180); setRunning(false) }}
          className="w-full py-1.5 rounded-xl text-xs text-stone-400 dark:text-stone-500 border border-dashed border-stone-200 dark:border-stone-700 hover:border-stone-400 transition-colors"
        >
          Neu starten
        </button>
      )}
    </div>
  )
}

// ── Supersatz (3 pairs × 2 sets = 6 × 4 min, auto-advance) ───────────────────

function SupersatzTimer({ autoStart, onDone }: { autoStart?: boolean; onDone?: () => void }) {
  const [seconds, setSeconds] = useState(240)
  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const done = count > 6

  const pair = Math.ceil(count / 2)
  const setInPair = ((count - 1) % 2) + 1

  useEffect(() => { if (autoStart) setRunning(true) }, []) // eslint-disable-line

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds])

  // Auto-advance when interval ends
  useEffect(() => {
    if (seconds !== 0 || done) return
    setRunning(false)
    const t = setTimeout(() => {
      if (count >= 6) {
        setCount(7)
      } else {
        setCount(c => c + 1)
        setSeconds(240)
        setRunning(true)
      }
    }, 800)
    return () => clearTimeout(t)
  }, [seconds]) // eslint-disable-line

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => onDoneRef.current?.(), 1500)
    return () => clearTimeout(t)
  }, [done])

  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {done ? 'Supersätze fertig ✓' : `Paar ${pair}/3 · Satz ${setInPair}/2`}
        </span>
        <span className={`font-mono text-lg font-bold ${seconds === 0 && !done ? 'text-red-500' : 'text-stone-900 dark:text-stone-100'}`}>
          {done ? '—' : fmt(seconds)}
        </span>
      </div>

      {!done && (
        <div className="flex gap-2">
          <button
            onClick={() => setRunning(r => !r)}
            disabled={seconds === 0}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-30 transition-colors"
          >
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
          <button
            onClick={() => { if (count >= 6) { setCount(7) } else { setCount(c => c + 1); setSeconds(240); setRunning(true) } }}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
          >
            {count < 6 ? 'Nächster →' : 'Fertig ✓'}
          </button>
        </div>
      )}

      {done && (
        <button
          onClick={() => { setCount(1); setSeconds(240); setRunning(false) }}
          className="w-full py-1.5 rounded-xl text-xs text-stone-400 dark:text-stone-500 border border-dashed border-stone-200 dark:border-stone-700 hover:border-stone-400 transition-colors"
        >
          Neu starten
        </button>
      )}
    </div>
  )
}

// ── Hochintensitätssatz (Tabata 8 × 20s+10s, auto-advances) ──────────────────

function HochintensitaetsTimer({ autoStart, onDone }: { autoStart?: boolean; onDone?: () => void }) {
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<'work' | 'rest'>('work')
  const [seconds, setSeconds] = useState(20)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => { if (autoStart) setRunning(true) }, []) // eslint-disable-line

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
    const t = setTimeout(() => onDoneRef.current?.(), 1500)
    return () => clearTimeout(t)
  }, [done])

  const reset = () => { setRound(1); setPhase('work'); setSeconds(20); setRunning(false); setDone(false) }

  const timerColor = done ? 'text-green-500' : phase === 'rest' ? 'text-blue-500' : 'text-stone-900 dark:text-stone-100'

  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-4 space-y-3">
      <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Hochintensität</span>

      <div className="flex items-start justify-center gap-3 py-1">
        <DisplayBox label="Zeit" colorClass={timerColor}>
          {done ? '—' : `0:${String(seconds).padStart(2, '0')}`}
        </DisplayBox>
        <DisplayBox label={`Runde ${round}/8`}>{round}</DisplayBox>
      </div>

      <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-1000 ${phase === 'work' ? 'bg-stone-900 dark:bg-stone-300' : 'bg-blue-400'}`}
          style={{ width: done ? '100%' : `${((round - 1) / 8 + (phase === 'rest' ? 0.5 : 0) / 8) * 100}%` }}
        />
      </div>

      {!done && (
        <p className="text-center text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {phase === 'work' ? 'Arbeit' : 'Pause'}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setRunning(r => !r)}
          disabled={done}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-30 transition-colors"
        >
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2.5 rounded-xl text-sm text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-600 hover:border-stone-400 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

// ── Zirkelintervall (20 min session timer) ────────────────────────────────────

export function ZirkelTimer({ autoStart }: { autoStart?: boolean } = {}) {
  const [seconds, setSeconds] = useState(1200)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { if (autoStart) setRunning(true) }, []) // eslint-disable-line

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (seconds === 0) setRunning(false)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds])

  const done = seconds === 0

  return (
    <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">Zirkelintervall</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">So viele Runden wie möglich in 20 min</p>
        </div>
        <span className={`font-mono text-xl font-bold ${done ? 'text-red-500' : 'text-stone-900 dark:text-stone-100'}`}>
          {fmt(seconds)}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setRunning(r => !r)}
          disabled={done}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-30 transition-colors"
        >
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        {done && (
          <button
            onClick={() => { setSeconds(1200); setRunning(false) }}
            className="flex-1 py-2 rounded-xl text-xs font-medium border border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400 hover:border-stone-400 transition-colors"
          >
            Neu starten
          </button>
        )}
      </div>
    </div>
  )
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function MethodTimer({ method, autoStart, onDone }: Props) {
  if (method === 'Stufenintervalle')    return <StufenintervallTimer autoStart={autoStart} onDone={onDone} />
  if (method === 'Intervallsätze')      return <IntervallsätzeTimer  autoStart={autoStart} onDone={onDone} />
  if (method === 'Supersätze')          return <SupersatzTimer        autoStart={autoStart} onDone={onDone} />
  if (method === 'Hochintensitätssätze') return <HochintensitaetsTimer autoStart={autoStart} onDone={onDone} />
  return null
}
