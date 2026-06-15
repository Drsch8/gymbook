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
  const live = running && !done
  const low  = live && pct < 20

  // Quiet card while idle; inverted card while counting so the active state pops
  return (
    <div
      className={`rounded-2xl px-4 py-3 border transition-colors duration-300 ${
        live
          ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100'
          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
      }`}
      style={{ animation: 'timer-slide-in 0.25s ease forwards' }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
          live ? 'text-stone-400 dark:text-stone-500' : 'text-stone-400 dark:text-stone-500'
        }`}>
          Rest
        </span>
        <div className="flex items-baseline gap-3">
          {live && (
            <button
              onClick={stop}
              disabled={!active}
              className="text-[11px] font-medium text-stone-500 dark:text-stone-400 hover:text-stone-300 dark:hover:text-stone-600 transition-colors"
            >
              Skip
            </button>
          )}
          <span className={`font-mono tabular-nums text-2xl font-bold leading-none ${
            live
              ? low ? 'text-red-400 dark:text-red-500' : 'text-white dark:text-stone-900'
              : 'text-stone-300 dark:text-stone-600'
          }`}>
            {live ? `${pad(mins)}:${pad(secs)}` : (defaultSeconds >= 60 ? `${defaultSeconds / 60}:${pad(defaultSeconds % 60)}` : `0:${pad(defaultSeconds)}`)}
          </span>
        </div>
      </div>
      <div className={`h-1 w-full rounded-full overflow-hidden ${
        live ? 'bg-white/15 dark:bg-stone-900/15' : 'bg-stone-100 dark:bg-stone-700'
      }`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            live
              ? low ? 'bg-red-400 dark:bg-red-500' : 'bg-white dark:bg-stone-900'
              : 'bg-stone-200 dark:bg-stone-600'
          }`}
          style={{ width: live ? `${pct}%` : '100%' }}
        />
      </div>
    </div>
  )
}
