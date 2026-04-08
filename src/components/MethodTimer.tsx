import { useEffect, useRef, useState } from 'react'

interface Props {
  method: string
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ── Stufenintervall (pyramid, 7.5 min = 450s per exercise) ───────────────────

function StufenintervallTimer() {
  const [seconds, setSeconds] = useState(450)
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState<'up' | 'down'>('up')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (seconds === 0) setRunning(false)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds])

  const advance = () => {
    if (dir === 'up') setStep(s => s + 1)
    else setStep(s => Math.max(1, s - 1))
  }

  const flip = () => setDir(d => d === 'up' ? 'down' : 'up')

  const done = seconds === 0

  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Stufenintervall</span>
        <span className={`font-mono text-lg font-bold ${done ? 'text-red-500' : 'text-stone-900 dark:text-stone-100'}`}>
          {done ? '0:00' : fmt(seconds)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 text-center">
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{step}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            {dir === 'up' ? `Wdh. ↑` : `Wdh. ↓`}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setStep(s => s + 1)}
            className="w-8 h-7 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
          >+</button>
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className="w-8 h-7 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
          >−</button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setRunning(r => !r)}
          disabled={done}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-30 transition-colors"
        >
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          onClick={advance}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
        >
          Satz fertig →
        </button>
        <button
          onClick={flip}
          className="px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400 hover:border-stone-400 transition-colors"
          title={dir === 'up' ? 'Wende (runter)' : 'Wende (rauf)'}
        >
          {dir === 'up' ? '↑' : '↓'}
        </button>
      </div>

      {done && (
        <button
          onClick={() => { setSeconds(450); setRunning(false); setStep(1); setDir('up') }}
          className="w-full py-1.5 rounded-xl text-xs text-stone-400 dark:text-stone-500 border border-dashed border-stone-200 dark:border-stone-700 hover:border-stone-400 transition-colors"
        >
          Neu starten
        </button>
      )}
    </div>
  )
}

// ── Supersatz (4 min = 240s per superset, 6 total) ───────────────────────────

function SupersatzTimer() {
  const [seconds, setSeconds] = useState(240)
  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (seconds === 0) setRunning(false)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds])

  const next = () => {
    setCount(c => Math.min(c + 1, 6))
    setSeconds(240)
    setRunning(false)
  }

  const done = count > 6

  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {done ? 'Supersätze fertig ✓' : `Supersatz ${count}/6`}
        </span>
        <span className={`font-mono text-lg font-bold ${seconds === 0 ? 'text-red-500' : 'text-stone-900 dark:text-stone-100'}`}>
          {fmt(seconds)}
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
            onClick={next}
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

// ── Hochintensitätssatz (Tabata: 8 × 20s work + 10s rest) ────────────────────

function HochintensitaetsTimer() {
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<'work' | 'rest'>('work')
  const [seconds, setSeconds] = useState(20)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running || done) return
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s > 1) return s - 1
        // advance phase
        if (phase === 'work') {
          setPhase('rest')
          return 10
        }
        // end of rest → next round
        if (round >= 8) {
          setRunning(false)
          setDone(true)
          return 0
        }
        setRound(r => r + 1)
        setPhase('work')
        return 20
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, round, done])

  const reset = () => {
    setRound(1); setPhase('work'); setSeconds(20); setRunning(false); setDone(false)
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {done ? 'Fertig ✓' : `Runde ${round}/8 · ${phase === 'work' ? 'Arbeit' : 'Pause'}`}
        </span>
        <span className={`font-mono text-lg font-bold ${phase === 'rest' && !done ? 'text-blue-500' : done ? 'text-green-500' : 'text-stone-900 dark:text-stone-100'}`}>
          {done ? '—' : `0:${String(seconds).padStart(2, '0')}`}
        </span>
      </div>

      {!done && (
        <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-1000 ${phase === 'work' ? 'bg-stone-900 dark:bg-stone-300' : 'bg-blue-400'}`}
            style={{ width: `${((round - 1) / 8 + (phase === 'rest' ? 0.5 : 0) / 8) * 100}%` }}
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setRunning(r => !r)}
          disabled={done}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-30 transition-colors"
        >
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-2 rounded-xl text-xs text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-600 hover:border-stone-400 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

// ── Zirkelintervall (20 min session timer) ────────────────────────────────────

export function ZirkelTimer() {
  const [seconds, setSeconds] = useState(1200)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

export function MethodTimer({ method }: Props) {
  if (method === 'Stufenintervalle') return <StufenintervallTimer />
  if (method === 'Supersätze') return <SupersatzTimer />
  if (method === 'Hochintensitätssätze') return <HochintensitaetsTimer />
  return null
}
