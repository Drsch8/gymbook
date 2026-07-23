import { useEffect, useRef } from 'react'
import type { ExerciseSet, TrackingType, WeightUnit } from '../types'
import { InlineWheel } from './InlineWheel'

interface Props {
  set: ExerciseSet
  index: number
  trackingType: TrackingType
  weightUnit: WeightUnit
  onChange: (updated: ExerciseSet) => void
  onRemove: () => void
  onComplete: () => void
  onStartTimer?: () => void
  active?: boolean
  previousSet?: { reps?: number; weight?: number; duration?: number }
}

function fmt(n: number | undefined, unit = '') {
  return n != null ? `${n}${unit}` : '—'
}

const REVEAL = 72

export function SetRow({ set, index, trackingType, weightUnit, onChange, onRemove, onComplete, onStartTimer, active = true, previousSet }: Props) {
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
        // Bias toward vertical so the inline wheels keep their scroll; only a
        // clearly horizontal drag reveals the delete action.
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8)
          s.dir = Math.abs(dx) > Math.abs(dy) * 1.3 ? 'h' : 'v'
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
        <div className="flex-1 min-w-0 flex items-center gap-2 py-1 px-1 bg-surface">
          <span className="w-5 text-center text-xs font-mono text-faint shrink-0">{index + 1}</span>

          <span className="w-12 text-center text-xs text-faint shrink-0 hidden sm:block">
            {trackingType === 'time'
              ? fmt(previousSet?.duration, 's')
              : previousSet
                ? `${fmt(previousSet.reps)}×${fmt(previousSet.weight, weightUnit)}`
                : '—'}
          </span>

          {trackingType === 'reps_weight' && (
            <>
              <InlineWheel value={set.reps} onChange={v => onChange({ ...set, reps: v })}
                step={1} max={100} disabled={locked} active={active} />
              <InlineWheel value={displayWeight(set.weight)} onChange={v => onChange({ ...set, weight: storeWeight(v) })}
                step={weightUnit === 'lbs' ? 2.5 : 1.25} max={weightUnit === 'lbs' ? 660 : 300} disabled={locked} active={active} />
            </>
          )}
          {trackingType === 'reps_only' && (
            <InlineWheel value={set.reps} onChange={v => onChange({ ...set, reps: v })}
              step={1} max={100} disabled={locked} active={active} />
          )}
          {trackingType === 'time' && (
            <InlineWheel value={set.duration} onChange={v => onChange({ ...set, duration: v })}
              step={5} max={3600} disabled={locked} active={active} />
          )}

          {trackingType === 'time' && onStartTimer && (
            <button
              onClick={onStartTimer}
              disabled={locked || !set.duration}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-elevated text-muted hover:bg-line disabled:opacity-30 transition-colors"
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
              'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
              locked
                ? 'bg-done text-fmbg'
                : 'bg-elevated text-faint hover:bg-line',
            ].join(' ')}
            aria-label={locked ? 'Mark incomplete' : 'Mark complete'}
          >
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 5.5l4 4 7-8" />
            </svg>
          </button>
        </div>

        {!locked && (
          <button
            className="flex-shrink-0 flex items-center justify-center bg-danger text-white text-xs font-semibold"
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
