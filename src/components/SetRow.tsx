import { useEffect, useRef, useState } from 'react'
import type { ExerciseSet, TrackingType, WeightUnit } from '../types'
import { WheelPicker } from './WheelPicker'

interface Props {
  set: ExerciseSet
  index: number
  trackingType: TrackingType
  weightUnit: WeightUnit
  onChange: (updated: ExerciseSet) => void
  onRemove: () => void
  onComplete: () => void
  onStartTimer?: () => void
  previousSet?: { reps?: number; weight?: number; duration?: number }
}

function fmt(n: number | undefined, unit = '') {
  return n != null ? `${n}${unit}` : '—'
}

const SLOT_H  = 62
const REVEAL  = 72

function NumCell({
  value, onChange, step = 1, max, disabled,
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  step?: number
  max: number
  disabled: boolean
}) {
  const cellRef = useRef<HTMLDivElement>(null)
  const [pickerRect, setPickerRect] = useState<DOMRect | null>(null)

  const decPlaces = (step.toString().split('.')[1] ?? '').length
  const label = value == null ? '—' : value.toFixed(decPlaces)

  const nudge = (dir: 1 | -1) => {
    const next = Math.min(max, Math.max(0, +((value ?? 0) + dir * step).toFixed(2)))
    if ('vibrate' in navigator) navigator.vibrate(4)
    onChange(next)
  }

  return (
    <div ref={cellRef} className="relative flex-1 min-w-0" style={{ height: SLOT_H }}>
      {/* Steppers: tap the arrows for ±1 step */}
      <button
        onClick={() => nudge(1)}
        disabled={disabled}
        className="absolute inset-x-0 top-0 h-5 z-10 flex items-start justify-center pt-1.5
          bg-gradient-to-b from-white dark:from-stone-800 to-transparent"
        aria-label="Increase"
      >
        <svg width="12" height="7" viewBox="0 0 12 7" className={disabled ? 'text-stone-200 dark:text-stone-700' : 'text-stone-400 dark:text-stone-500'}>
          <path d="M6 0L12 7H0L6 0Z" fill="currentColor" />
        </svg>
      </button>
      <button
        onClick={() => nudge(-1)}
        disabled={disabled}
        className="absolute inset-x-0 bottom-0 h-5 z-10 flex items-end justify-center pb-1.5
          bg-gradient-to-t from-white dark:from-stone-800 to-transparent"
        aria-label="Decrease"
      >
        <svg width="12" height="7" viewBox="0 0 12 7" className={disabled ? 'text-stone-200 dark:text-stone-700' : 'text-stone-400 dark:text-stone-500'}>
          <path d="M6 7L0 0H12L6 7Z" fill="currentColor" />
        </svg>
      </button>

      {/* Tap the number to open the native scroll wheel */}
      <button
        onClick={() => { if (!disabled) setPickerRect(cellRef.current!.getBoundingClientRect()) }}
        disabled={disabled}
        className={`absolute inset-x-0 flex items-center justify-center font-mono tabular-nums select-none ${
          disabled ? 'text-stone-400 dark:text-stone-500 cursor-default' : 'text-stone-900 dark:text-stone-100'
        }`}
        style={{ top: 20, bottom: 20, fontSize: 30, fontWeight: 600, opacity: disabled ? 0.4 : 1 }}
      >
        {label}
      </button>

      {pickerRect && (
        <WheelPicker
          rect={pickerRect}
          value={value ?? 0}
          min={0}
          max={max}
          step={step}
          decimals={decPlaces}
          onClose={v => { setPickerRect(null); if (v != null) onChange(v) }}
        />
      )}
    </div>
  )
}

export function SetRow({ set, index, trackingType, weightUnit, onChange, onRemove, onComplete, onStartTimer, previousSet }: Props) {
  const lbsFactor = 2.20462
  const locked    = set.completed

  const displayWeight = (kg: number | undefined) => {
    if (kg == null) return undefined
    return weightUnit === 'lbs' ? +(kg * lbsFactor).toFixed(1) : kg
  }
  const storeWeight = (val: number | undefined) => {
    if (val == null) return undefined
    return weightUnit === 'lbs' ? +(val / lbsFactor).toFixed(2) : val
  }

  const slideRef  = useRef<HTMLDivElement>(null)
  const swipeXRef = useRef(0)

  const setSlideX = (x: number, animated: boolean) => {
    swipeXRef.current = x
    const el = slideRef.current
    if (!el) return
    el.style.transition = animated ? 'transform 0.22s ease' : 'none'
    el.style.transform  = `translateX(${x}px)`
  }

  useEffect(() => {
    if (locked) setSlideX(0, true)
  }, [locked])

  useEffect(() => {
    const el = slideRef.current
    if (!el || locked) return

    const s = { startX: 0, startY: 0, dir: null as 'h' | 'v' | null, baseX: 0 }

    const onStart = (e: TouchEvent) => {
      s.startX = e.touches[0].clientX
      s.startY = e.touches[0].clientY
      s.dir    = null
      s.baseX  = swipeXRef.current
    }

    const onMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - s.startX
      const dy = e.touches[0].clientY - s.startY
      if (!s.dir) {
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5)
          s.dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
        return
      }
      if (s.dir === 'v') return
      e.preventDefault()
      setSlideX(Math.max(-REVEAL, Math.min(0, s.baseX + dx)), false)
    }

    const onEnd = () => {
      if (s.dir === 'h')
        setSlideX(swipeXRef.current < -REVEAL / 2 ? -REVEAL : 0, true)
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove',  onMove,  { passive: false })
    el.addEventListener('touchend',   onEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove',  onMove)
      el.removeEventListener('touchend',   onEnd)
    }
  }, [locked])

  return (
    <div className={`set-row overflow-hidden rounded-xl transition-opacity duration-200 ${locked ? 'opacity-40' : ''}`}>
      {/* Flex row wider than container: row content + delete zone. Delete zone is naturally
          clipped by overflow-hidden at rest — no z-index, no bleed. */}
      <div
        ref={slideRef}
        className="flex"
        style={{ transform: 'translateX(0)', width: locked ? undefined : `calc(100% + ${REVEAL}px)` }}
      >
        <div className="flex-1 min-w-0 flex items-center gap-2 py-1 px-1 bg-white dark:bg-stone-800">
          <span className="w-5 text-center text-xs font-mono text-stone-400 shrink-0">{index + 1}</span>

          <span className="w-14 text-center text-xs text-stone-400 shrink-0 hidden sm:block">
            {trackingType === 'time'
              ? fmt(previousSet?.duration, 's')
              : previousSet
                ? `${fmt(previousSet.reps)}×${fmt(previousSet.weight, weightUnit)}`
                : '—'}
          </span>

          {trackingType === 'reps_weight' && (
            <>
              <NumCell value={set.reps} onChange={v => onChange({ ...set, reps: v })}
                step={1} max={100} disabled={locked} />
              <NumCell value={displayWeight(set.weight)} onChange={v => onChange({ ...set, weight: storeWeight(v) })}
                step={weightUnit === 'lbs' ? 2.5 : 1.25} max={weightUnit === 'lbs' ? 660 : 300} disabled={locked} />
            </>
          )}
          {trackingType === 'reps_only' && (
            <NumCell value={set.reps} onChange={v => onChange({ ...set, reps: v })}
              step={1} max={100} disabled={locked} />
          )}
          {trackingType === 'time' && (
            <NumCell value={set.duration} onChange={v => onChange({ ...set, duration: v })}
              step={5} max={3600} disabled={locked} />
          )}

          {trackingType === 'time' && onStartTimer && (
            <button
              onClick={onStartTimer}
              disabled={locked || !set.duration}
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 border border-stone-200 dark:border-stone-600 disabled:opacity-30 transition-colors"
              aria-label="Start set timer"
            >
              <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor">
                <polygon points="1,0.5 10.5,6 1,11.5" />
              </svg>
            </button>
          )}

          <button
            onClick={onComplete}
            className={[
              'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-sm font-semibold',
              locked ? 'bg-stone-900 dark:bg-stone-300 text-white dark:text-stone-900' : 'bg-stone-100 dark:bg-stone-700 text-stone-400 hover:bg-stone-200 border border-stone-200 dark:border-stone-600',
            ].join(' ')}
            aria-label={locked ? 'Mark incomplete' : 'Mark complete'}
          >
            ✓
          </button>
        </div>

        {!locked && (
          <button
            className="flex-shrink-0 flex items-center justify-center bg-red-500 text-white text-xs font-semibold"
            style={{ width: REVEAL }}
            onClick={() => { setSlideX(0, true); onRemove() }}
            aria-label="Remove set"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
