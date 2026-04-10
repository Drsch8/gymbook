import { useEffect } from 'react'
import { useRestTimer } from '../hooks/useRestTimer'

interface Props {
  defaultSeconds: number
  lastCompleted: number  // timestamp; 0 = never
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function RestTimer({ defaultSeconds, lastCompleted }: Props) {
  const { remaining, running, start, stop } = useRestTimer(defaultSeconds)

  // Only auto-start if this mount was caused by a set tick (< 500 ms ago),
  // not by a layout change like adding an exercise.
  useEffect(() => {
    if (lastCompleted > 0 && Date.now() - lastCompleted < 500) start()
  }, [])

  const active = lastCompleted > 0
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct  = defaultSeconds > 0 ? (remaining / defaultSeconds) * 100 : 0
  const done = !running && remaining === 0

  return (
    <div
      className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 space-y-2"
      style={{ animation: 'timer-slide-in 0.25s ease forwards' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-400 dark:text-stone-500">Rest</span>
        <span className={`text-xs font-mono tabular-nums ${!running || done ? 'text-stone-300 dark:text-stone-600' : pct < 20 ? 'text-red-500' : 'text-stone-700 dark:text-stone-300'}`}>
          {running && !done ? `${pad(mins)}:${pad(secs)}` : `${defaultSeconds >= 60 ? `${defaultSeconds / 60}m` : `${defaultSeconds}s`}`}
        </span>
      </div>
      <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            !running || done ? 'bg-stone-200 dark:bg-stone-600' : pct < 20 ? 'bg-red-400' : 'bg-stone-800 dark:bg-stone-300'
          }`}
          style={{ width: running && !done ? `${pct}%` : '100%' }}
        />
      </div>
      <button
        onClick={stop}
        disabled={!active || !running || done}
        className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors disabled:invisible"
      >
        Skip
      </button>
    </div>
  )
}
