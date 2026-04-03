import { useRef, useState } from 'react'
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

function NumCell({
  value, onChange, placeholder, step = 1, inputMode = 'numeric', disabled, unit,
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  placeholder: string
  step?: number
  inputMode?: 'numeric' | 'decimal'
  disabled: boolean
  unit?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragStart = useRef<number | null>(null)
  const dragBase = useRef<number>(0)
  const lastStep = useRef<number>(0)
  const [dragging, setDragging] = useState(false)
  const [delta, setDelta] = useState(0) // steps from base during drag

  const clamp = (v: number) => Math.max(0, +(v).toFixed(2))

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    dragStart.current = e.touches[0].clientY
    dragBase.current = value ?? 0
    lastStep.current = 0
    setDelta(0)
    setDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || dragStart.current === null) return
    e.preventDefault()
    const dy = dragStart.current - e.touches[0].clientY
    const steps = Math.round(dy / 7)
    if (steps !== lastStep.current) {
      lastStep.current = steps
      setDelta(steps)
      onChange(clamp(dragBase.current + steps * step))
      if ('vibrate' in navigator) navigator.vibrate(4)
    }
  }

  const handleTouchEnd = () => {
    dragStart.current = null
    setDragging(false)
    setDelta(0)
  }

  const displayDelta = delta !== 0
    ? `${delta > 0 ? '+' : ''}${+(delta * step).toFixed(2)}${unit ? ` ${unit}` : ''}`
    : null

  return (
    <div
      className={`relative flex-1 min-w-0 ${disabled ? 'cursor-default' : 'cursor-text'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => !disabled && !dragging && inputRef.current?.focus()}
    >
      {/* Floating delta pill — visible while dragging */}
      {dragging && (
        <div className={[
          'absolute -top-8 left-1/2 -translate-x-1/2 z-10',
          'px-2 py-0.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap',
          'pointer-events-none select-none',
          delta > 0
            ? 'bg-stone-900 text-white'
            : delta < 0
              ? 'bg-red-500 text-white'
              : 'bg-stone-200 text-stone-600',
        ].join(' ')}>
          {delta > 0 && <span className="mr-0.5">↑</span>}
          {delta < 0 && <span className="mr-0.5">↓</span>}
          {displayDelta ?? '·'}
        </div>
      )}

      {/* Drag hint arrows — shown when not dragging and not disabled */}
      {!disabled && !dragging && (
        <div className="absolute inset-y-0 right-1.5 flex flex-col items-center justify-center gap-0 opacity-0 group-hover:opacity-100 pointer-events-none">
          <svg className="w-2.5 h-2.5 text-stone-300" fill="none" viewBox="0 0 10 6" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M1 5l4-4 4 4" />
          </svg>
          <svg className="w-2.5 h-2.5 text-stone-300" fill="none" viewBox="0 0 10 6" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M1 1l4 4 4-4" />
          </svg>
        </div>
      )}

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
        // font-size: 16px prevents iOS Safari from zooming on focus
        style={{ fontSize: '16px' }}
        className={[
          'w-full text-center rounded-lg py-2 font-mono transition-colors',
          'border focus:outline-none appearance-none',
          disabled
            ? 'bg-transparent border-transparent text-stone-400 pointer-events-none select-none'
            : dragging
              ? 'bg-stone-900 border-stone-900 text-white'
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
    <div className={`group flex items-center gap-2 py-1 px-1 transition-opacity duration-200 ${locked ? 'opacity-40' : ''}`}>
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
            placeholder="—" step={1} inputMode="numeric" disabled={locked} unit="reps" />
          <NumCell value={displayWeight(set.weight)} onChange={v => onChange({ ...set, weight: storeWeight(v) })}
            placeholder="—" step={weightUnit === 'lbs' ? 2.5 : 1.25} inputMode="decimal" disabled={locked} unit={weightUnit} />
        </>
      )}
      {trackingType === 'reps_only' && (
        <NumCell value={set.reps} onChange={v => onChange({ ...set, reps: v })}
          placeholder="—" step={1} inputMode="numeric" disabled={locked} unit="reps" />
      )}
      {trackingType === 'time' && (
        <NumCell value={set.duration} onChange={v => onChange({ ...set, duration: v })}
          placeholder="—" step={5} inputMode="numeric" disabled={locked} unit="s" />
      )}

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

      {!locked ? (
        <button onClick={onRemove}
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Remove set">
          ✕
        </button>
      ) : (
        <span className="w-8 shrink-0" />
      )}
    </div>
  )
}
