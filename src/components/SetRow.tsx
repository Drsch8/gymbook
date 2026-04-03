import { useRef } from 'react'
import type { ExerciseSet, TrackingType, WeightUnit } from '../types'

interface Props {
  set: ExerciseSet
  index: number
  trackingType: TrackingType
  weightUnit: WeightUnit
  onChange: (updated: ExerciseSet) => void
  onRemove: () => void
  onComplete: () => void
  previousSet?: { reps?: number; weight?: number; duration?: number }
}

function fmt(n: number | undefined, unit = '') {
  return n != null ? `${n}${unit}` : '—'
}

/** Tappable number cell — focuses a hidden input on tap, swipe up/down to nudge */
function NumCell({
  value, onChange, placeholder, step = 1, inputMode = 'numeric', disabled,
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  placeholder: string
  step?: number
  inputMode?: 'numeric' | 'decimal'
  disabled: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragStart = useRef<number | null>(null)
  const dragBase = useRef<number>(0)

  const clamp = (v: number) => Math.max(0, +(v).toFixed(2))

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    dragStart.current = e.touches[0].clientY
    dragBase.current = value ?? 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || dragStart.current === null) return
    e.preventDefault()
    const dy = dragStart.current - e.touches[0].clientY
    const steps = Math.round(dy / 6)
    onChange(clamp(dragBase.current + steps * step))
  }

  const handleTouchEnd = () => { dragStart.current = null }

  return (
    <div
      className={`relative flex-1 min-w-0 ${disabled ? 'cursor-default' : 'cursor-text'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => !disabled && inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="number"
        inputMode={inputMode}
        step={step}
        min={0}
        disabled={disabled}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value === '' ? undefined : +e.target.value)}
        className={[
          'w-full text-center rounded-lg py-2 text-sm font-mono transition-colors',
          'border focus:outline-none',
          disabled
            ? 'bg-transparent border-transparent text-stone-400 pointer-events-none select-none'
            : 'bg-stone-100 border-stone-200 text-stone-900 focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-stone-900/10',
        ].join(' ')}
      />
    </div>
  )
}

export function SetRow({ set, index, trackingType, weightUnit, onChange, onRemove, onComplete, previousSet }: Props) {
  const lbsFactor = 2.20462
  const locked = set.completed

  const displayWeight = (kg: number | undefined) => {
    if (kg == null) return undefined
    return weightUnit === 'lbs' ? +(kg * lbsFactor).toFixed(1) : kg
  }

  const storeWeight = (val: number | undefined) => {
    if (val == null) return undefined
    return weightUnit === 'lbs' ? +(val / lbsFactor).toFixed(2) : val
  }

  return (
    <div className={`flex items-center gap-2 py-1 px-1 transition-opacity duration-200 ${locked ? 'opacity-40' : ''}`}>
      {/* Set number */}
      <span className="w-5 text-center text-xs font-mono text-stone-400 shrink-0">{index + 1}</span>

      {/* Previous reference */}
      <span className="w-14 text-center text-xs text-stone-400 shrink-0 hidden sm:block">
        {trackingType === 'time'
          ? fmt(previousSet?.duration, 's')
          : previousSet
            ? `${fmt(previousSet.reps)}×${fmt(previousSet.weight, weightUnit)}`
            : '—'}
      </span>

      {/* Inputs */}
      {trackingType === 'reps_weight' && (
        <>
          <NumCell value={set.reps} onChange={v => onChange({ ...set, reps: v })}
            placeholder="—" step={1} inputMode="numeric" disabled={locked} />
          <NumCell value={displayWeight(set.weight)} onChange={v => onChange({ ...set, weight: storeWeight(v) })}
            placeholder="—" step={weightUnit === 'lbs' ? 2.5 : 1.25} inputMode="decimal" disabled={locked} />
        </>
      )}
      {trackingType === 'reps_only' && (
        <NumCell value={set.reps} onChange={v => onChange({ ...set, reps: v })}
          placeholder="—" step={1} inputMode="numeric" disabled={locked} />
      )}
      {trackingType === 'time' && (
        <NumCell value={set.duration} onChange={v => onChange({ ...set, duration: v })}
          placeholder="—" step={5} inputMode="numeric" disabled={locked} />
      )}

      {/* Complete */}
      <button
        onClick={onComplete}
        className={[
          'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-sm font-semibold',
          locked
            ? 'bg-stone-900 text-white'
            : 'bg-stone-100 text-stone-400 hover:bg-stone-200 border border-stone-200',
        ].join(' ')}
        aria-label={locked ? 'Mark incomplete' : 'Mark complete'}
      >
        ✓
      </button>

      {/* Remove — hidden when locked */}
      {!locked && (
        <button onClick={onRemove}
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Remove set">
          ✕
        </button>
      )}
      {locked && <span className="w-8 shrink-0" />}
    </div>
  )
}
