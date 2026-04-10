import { useEffect, useRef, useState } from 'react'
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

const SLOT_H = 28
const GHOST_OFFSETS = [-2, -1, 1, 2]
const GHOST_FONT    = [11, 15, 15, 11]
const GHOST_OPACITY = [0.15, 0.38, 0.38, 0.15]
const GHOST_BLUR    = [3.5, 1.5, 1.5, 3.5]
const REVEAL        = 72

function NumCell({
  value, onChange, step = 1, inputMode = 'numeric', disabled,
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  step?: number
  inputMode?: 'numeric' | 'decimal'
  disabled: boolean
}) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const dragStart = useRef<number | null>(null)
  const dragBase  = useRef<number>(0)
  const lastStep  = useRef<number>(0)
  const [dragging, setDragging] = useState(false)

  const clamp = (v: number) => Math.max(0, +(v).toFixed(2))

  useEffect(() => {
    if (!dragging) return
    const prevent = (e: TouchEvent) => e.preventDefault()
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => document.removeEventListener('touchmove', prevent)
  }, [dragging])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    dragStart.current = e.touches[0].clientY
    dragBase.current  = value ?? 0
    lastStep.current  = 0
    setDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || dragStart.current === null) return
    e.preventDefault()
    const dy    = dragStart.current - e.touches[0].clientY
    const steps = Math.round(dy / 20)
    if (steps !== lastStep.current) {
      lastStep.current = steps
      onChange(clamp(dragBase.current + steps * step))
      if ('vibrate' in navigator) navigator.vibrate(4)
    }
  }

  const handleTouchEnd = () => {
    dragStart.current = null
    setDragging(false)
  }

  const centerLabel = value == null ? '—' : String(+value.toFixed(2))

  return (
    <div
      className={`relative flex-1 min-w-0 ${dragging ? 'num-dragging' : ''} ${disabled ? 'cursor-default' : 'cursor-ns-resize'}`}
      style={{ height: SLOT_H }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => { if (!disabled && lastStep.current === 0) inputRef.current?.focus() }}
    >
      {dragging && GHOST_OFFSETS.map((offset, i) => {
        const raw = (value ?? 0) + offset * step
        if (raw < 0) return null
        return (
          <div
            key={offset}
            className="absolute inset-x-0 flex items-center justify-center font-mono tabular-nums pointer-events-none select-none text-stone-500 dark:text-stone-400"
            style={{
              height: SLOT_H,
              top: offset < 0 ? Math.abs(offset) * -SLOT_H : Math.abs(offset) * SLOT_H,
              fontSize: GHOST_FONT[i],
              opacity: GHOST_OPACITY[i],
              filter: `blur(${GHOST_BLUR[i]}px)`,
            }}
          >
            {String(+clamp(raw).toFixed(2))}
          </div>
        )
      })}

      {dragging && !disabled && (
        <div className="absolute inset-x-0 inset-y-0 pointer-events-none border-t border-b border-stone-300 dark:border-stone-600" />
      )}

      <div
        className={`absolute inset-0 flex items-center justify-center font-mono tabular-nums pointer-events-none select-none ${
          disabled ? 'text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'
        }`}
        style={{ fontSize: 30, fontWeight: 600, opacity: disabled ? 0.4 : 1 }}
      >
        {centerLabel}
      </div>

      <input
        ref={inputRef}
        type="number"
        inputMode={inputMode}
        step={step}
        min={0}
        disabled={disabled}
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? undefined : clamp(+e.target.value))}
        className="absolute inset-0 opacity-0 w-full pointer-events-none"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  )
}

export function SetRow({ set, index, trackingType, weightUnit, onChange, onRemove, onComplete, previousSet }: Props) {
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

  // Reset swipe when row is locked (completed)
  useEffect(() => {
    if (locked) setSlideX(0, true)
  }, [locked])

  // Attach non-passive touchmove listener for swipe gesture
  useEffect(() => {
    const el = slideRef.current
    if (!el || locked) return

    const startX = { v: 0 }
    const startY = { v: 0 }
    const dir    = { v: null as 'h' | 'v' | null }
    const baseX  = { v: 0 }

    const onStart = (e: TouchEvent) => {
      startX.v = e.touches[0].clientX
      startY.v = e.touches[0].clientY
      dir.v    = null
      baseX.v  = swipeXRef.current
    }

    const onMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX.v
      const dy = e.touches[0].clientY - startY.v
      if (!dir.v) {
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5)
          dir.v = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
        return
      }
      if (dir.v === 'v') return
      e.preventDefault()
      setSlideX(Math.max(-REVEAL, Math.min(0, baseX.v + dx)), false)
    }

    const onEnd = () => {
      if (dir.v === 'h')
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
    <div className={`set-row relative overflow-hidden rounded-xl transition-opacity duration-200 ${locked ? 'opacity-40' : ''}`}>
      {/* Delete button — revealed by swiping left */}
      {!locked && (
        <button
          className="absolute right-0 inset-y-0 flex items-center justify-center bg-red-500 text-white text-xs font-semibold"
          style={{ width: REVEAL }}
          onClick={() => { setSlideX(0, true); onRemove() }}
          aria-label="Remove set"
        >
          Remove
        </button>
      )}

      {/* Sliding row content */}
      <div
        ref={slideRef}
        className="relative flex items-center gap-2 py-1 px-1 bg-white dark:bg-stone-800"
      >
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
              step={1} inputMode="numeric" disabled={locked} />
            <NumCell value={displayWeight(set.weight)} onChange={v => onChange({ ...set, weight: storeWeight(v) })}
              step={weightUnit === 'lbs' ? 2.5 : 1.25} inputMode="decimal" disabled={locked} />
          </>
        )}
        {trackingType === 'reps_only' && (
          <NumCell value={set.reps} onChange={v => onChange({ ...set, reps: v })}
            step={1} inputMode="numeric" disabled={locked} />
        )}
        {trackingType === 'time' && (
          <NumCell value={set.duration} onChange={v => onChange({ ...set, duration: v })}
            step={5} inputMode="numeric" disabled={locked} />
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
    </div>
  )
}
