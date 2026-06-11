import { useEffect, useRef, useState } from 'react'
import type { ExerciseSet, TrackingType, WeightUnit } from '../types'
import { dragState } from '../utils/dragState'

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
  value, onChange, step = 1, disabled,
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  step?: number
  disabled: boolean
}) {
  const cellRef    = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  // Keep latest prop values accessible inside stable native handlers
  const disabledRef  = useRef(disabled)
  const valueRef     = useRef(value)
  const stepRef      = useRef(step)
  const onChangeRef  = useRef(onChange)
  useEffect(() => { disabledRef.current = disabled  }, [disabled])
  useEffect(() => { valueRef.current    = value     }, [value])
  useEffect(() => { stepRef.current     = step      }, [step])
  useEffect(() => { onChangeRef.current = onChange  }, [onChange])

  useEffect(() => {
    const el = cellRef.current!
    const PX_PER_STEP = 20
    // All mutable drag state in a plain object — no React state, no closures captured by value.
    // The value is committed to parent only once the gesture (incl. momentum) settles,
    // so there are zero re-renders during drag.
    const d = {
      active: false, startY: 0, startX: 0, base: 0,
      raw: 0,                 // continuous steps travelled since touchstart
      lastStep: 0,
      vel: 0, lastY: 0, lastT: 0,   // velocity tracking (steps/ms)
      rect: null as DOMRect | null, dir: null as 'h' | 'v' | null,
      raf: 0,
    }

    const valueAt = (steps: number) =>
      Math.max(0, +(d.base + steps * stepRef.current).toFixed(2))

    // Smallest raw allowed so the value never goes below 0
    const minRaw = () => -d.base / stepRef.current

    const publish = () =>
      dragState.set({ rect: d.rect!, value: valueAt(Math.round(d.raw)), step: stepRef.current, rawSteps: d.raw })

    const hapticOnStepChange = () => {
      const steps = Math.round(d.raw)
      if (steps !== d.lastStep) {
        d.lastStep = steps
        if ('vibrate' in navigator) navigator.vibrate(4)
      }
    }

    const commit = () => {
      onChangeRef.current(valueAt(Math.round(d.raw)))
      setDragging(false)
      dragState.set(null)
    }

    // Ease the fractional offset onto the snapped step, then commit
    const settle = () => {
      const from = d.raw
      const to   = Math.round(d.raw)
      if (Math.abs(to - from) < 0.01) { commit(); return }
      const t0  = performance.now()
      const DUR = 150
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / DUR)
        d.raw = from + (to - from) * (1 - (1 - t) ** 3)
        publish()
        if (t < 1) { d.raf = requestAnimationFrame(tick); return }
        d.raf = 0
        commit()
      }
      d.raf = requestAnimationFrame(tick)
    }

    // Momentum scroll after a flick: decay velocity, then snap to the nearest step
    const glide = () => {
      d.vel = Math.max(-0.08, Math.min(0.08, d.vel))
      let last = performance.now()
      const tick = (now: number) => {
        const dt = now - last
        last = now
        d.raw += d.vel * dt
        d.vel *= Math.exp(-dt / 380)
        if (d.raw <= minRaw()) { d.raw = minRaw(); d.vel = 0 }
        hapticOnStepChange()
        publish()
        if (Math.abs(d.vel) < 0.0005) { d.raf = 0; settle(); return }
        d.raf = requestAnimationFrame(tick)
      }
      d.raf = requestAnimationFrame(tick)
    }

    const onMove = (e: TouchEvent) => {
      if (!d.active) return

      // Determine direction on first significant movement
      if (d.dir === null) {
        const dx = e.touches[0].clientX - d.startX
        const dy = d.startY - e.touches[0].clientY
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          d.dir = Math.abs(dy) >= Math.abs(dx) ? 'v' : 'h'
          if (d.dir === 'v') {
            setDragging(true)
            publish()
          }
        }
        if (d.dir === null) return
        if (d.dir === 'h') {
          // Release to row swipe handler — no ghost picker, no parent update
          d.active = false
          document.removeEventListener('touchmove', onMove)
          document.removeEventListener('touchend',  onEnd)
          return
        }
      }

      e.preventDefault()
      const y   = e.touches[0].clientY
      const now = e.timeStamp
      d.raw = Math.max(minRaw(), (d.startY - y) / PX_PER_STEP)
      const dt = now - d.lastT
      if (dt > 0) {
        const instV = ((d.lastY - y) / PX_PER_STEP) / dt
        d.vel = d.vel === 0 ? instV : 0.5 * d.vel + 0.5 * instV
      }
      d.lastY = y
      d.lastT = now
      hapticOnStepChange()
      // Refresh rect each frame so the ghost stays aligned even if layout shifts
      // (e.g. soft keyboard opening pushes the cell's position)
      d.rect = el.getBoundingClientRect()
      publish()
    }

    const onEnd = () => {
      if (!d.active) return
      d.active = false
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend',  onEnd)
      if (d.dir !== 'v') return
      // A pause before lifting means no flick — kill stale velocity
      if (performance.now() - d.lastT > 80) d.vel = 0
      if (Math.abs(d.vel) > 0.004) glide()
      else settle()
    }

    const onStart = (e: TouchEvent) => {
      if (disabledRef.current) return
      if (d.raf) {
        // Catch a glide/settle in flight: stop it and continue from the current value
        cancelAnimationFrame(d.raf)
        d.raf = 0
        const caught = valueAt(Math.round(d.raw))
        onChangeRef.current(caught)
        setDragging(false)
        dragState.set(null)
        d.base = caught
      } else {
        d.base = valueRef.current ?? 0
      }
      d.rect     = el.getBoundingClientRect()
      d.startY   = e.touches[0].clientY
      d.startX   = e.touches[0].clientX
      d.raw      = 0
      d.lastStep = 0
      d.vel      = 0
      d.lastY    = d.startY
      d.lastT    = e.timeStamp
      d.dir      = null
      d.active   = true
      document.addEventListener('touchmove', onMove, { passive: false })
      document.addEventListener('touchend',  onEnd,  { passive: true  })
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend',  onEnd)
      if (d.raf) { cancelAnimationFrame(d.raf); dragState.set(null) }
    }
  }, [])

  const decPlaces = (step.toString().split('.')[1] ?? '').length
  const label = value == null ? '—' : value.toFixed(decPlaces)

  return (
    <div
      ref={cellRef}
      className={`relative flex-1 min-w-0 ${disabled ? 'cursor-default' : 'cursor-ns-resize'}`}
      style={{ height: SLOT_H }}
    >
      <div
        className="absolute inset-x-0 top-0 h-6 pointer-events-none flex items-start justify-center pt-1.5
          bg-gradient-to-b from-white dark:from-stone-800 to-transparent transition-opacity duration-150"
        style={{ opacity: dragging ? 0 : 1 }}
      >
        <svg width="12" height="7" viewBox="0 0 12 7" className={disabled ? 'text-stone-200 dark:text-stone-700' : 'text-stone-400 dark:text-stone-500'}>
          <path d="M6 0L12 7H0L6 0Z" fill="currentColor" />
        </svg>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-6 pointer-events-none flex items-end justify-center pb-1.5
          bg-gradient-to-t from-white dark:from-stone-800 to-transparent transition-opacity duration-150"
        style={{ opacity: dragging ? 0 : 1 }}
      >
        <svg width="12" height="7" viewBox="0 0 12 7" className={disabled ? 'text-stone-200 dark:text-stone-700' : 'text-stone-400 dark:text-stone-500'}>
          <path d="M6 7L0 0H12L6 7Z" fill="currentColor" />
        </svg>
      </div>
      <div
        className={`absolute inset-0 flex items-center justify-center font-mono tabular-nums pointer-events-none select-none transition-opacity duration-150 ${
          disabled ? 'text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'
        }`}
        style={{ fontSize: 30, fontWeight: 600, opacity: disabled ? 0.4 : dragging ? 0 : 1 }}
      >
        {label}
      </div>
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
      if (dragState.get() !== null) return   // number-cell drag in progress — lock swipe
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
                step={1} disabled={locked} />
              <NumCell value={displayWeight(set.weight)} onChange={v => onChange({ ...set, weight: storeWeight(v) })}
                step={weightUnit === 'lbs' ? 2.5 : 1.25} disabled={locked} />
            </>
          )}
          {trackingType === 'reps_only' && (
            <NumCell value={set.reps} onChange={v => onChange({ ...set, reps: v })}
              step={1} disabled={locked} />
          )}
          {trackingType === 'time' && (
            <NumCell value={set.duration} onChange={v => onChange({ ...set, duration: v })}
              step={5} disabled={locked} />
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
