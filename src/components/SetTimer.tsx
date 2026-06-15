import { useEffect, useRef, useState } from 'react'

interface Props {
  seconds: number
  label: string
  onDone: () => void
  onStop: () => void
}

function pad(n: number) { return String(n).padStart(2, '0') }

// Countdown for a time-tracked set — inverted card matching the running rest timer
export function SetTimer({ seconds, label, onDone, onStop }: Props) {
  const [remaining, setRemaining] = useState(seconds)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const iv = setInterval(() => setRemaining(prev => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (remaining > 0) return
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
    onDoneRef.current()
  }, [remaining])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct  = seconds > 0 ? (remaining / seconds) * 100 : 0
  const low  = pct < 20

  return (
    <div
      className="rounded-2xl px-4 py-3 border bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100"
      style={{ animation: 'timer-slide-in 0.25s ease forwards' }}
    >
      <div className="flex items-baseline justify-between mb-2 gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500 truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-3 shrink-0">
          <button
            onClick={onStop}
            className="text-[11px] font-medium text-stone-500 dark:text-stone-400 hover:text-stone-300 dark:hover:text-stone-600 transition-colors"
          >
            Stop
          </button>
          <span className={`font-mono tabular-nums text-2xl font-bold leading-none ${
            low ? 'text-red-400 dark:text-red-500' : 'text-white dark:text-stone-900'
          }`}>
            {pad(mins)}:{pad(secs)}
          </span>
        </div>
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden bg-white/15 dark:bg-stone-900/15">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            low ? 'bg-red-400 dark:bg-red-500' : 'bg-white dark:bg-stone-900'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
