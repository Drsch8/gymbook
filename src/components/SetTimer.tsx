import { useEffect, useRef, useState } from 'react'

interface Props {
  seconds: number
  label: string
  onDone: () => void
  onStop: () => void
}

function pad(n: number) { return String(n).padStart(2, '0') }

// Countdown for a time-tracked set — same look and feel as the rest timer
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

  return (
    <div
      className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 space-y-2"
      style={{ animation: 'timer-slide-in 0.25s ease forwards' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-400 dark:text-stone-500">{label}</span>
        <span className={`text-xs font-mono tabular-nums ${pct < 20 ? 'text-red-500' : 'text-stone-700 dark:text-stone-300'}`}>
          {pad(mins)}:{pad(secs)}
        </span>
      </div>
      <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${pct < 20 ? 'bg-red-400' : 'bg-stone-800 dark:bg-stone-300'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <button
        onClick={onStop}
        className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
      >
        Stop
      </button>
    </div>
  )
}
