import type { ExerciseSet, TrackingType, WeightUnit } from '../types'
import { StepInput } from './StepInput'

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

function fmt(n: number | undefined, unit: string) {
  return n != null ? `${n}${unit}` : '—'
}

export function SetRow({ set, index, trackingType, weightUnit, onChange, onRemove, onComplete, previousSet }: Props) {
  const lbsFactor = 2.20462

  const displayWeight = (kg: number | undefined) => {
    if (kg == null) return undefined
    return weightUnit === 'lbs' ? +(kg * lbsFactor).toFixed(1) : kg
  }

  const storeWeight = (val: number | undefined) => {
    if (val == null) return undefined
    return weightUnit === 'lbs' ? +(val / lbsFactor).toFixed(2) : val
  }

  return (
    <div className={`flex items-center gap-2 py-1.5 px-1 transition-opacity ${set.completed ? 'opacity-40' : ''}`}>
      <span className="w-6 text-center text-xs font-mono text-stone-400 shrink-0">{index + 1}</span>

      <span className="w-14 text-center text-xs text-stone-400 shrink-0 hidden sm:block">
        {trackingType === 'time'
          ? fmt(previousSet?.duration, 's')
          : previousSet
            ? `${fmt(previousSet.reps, '')}×${fmt(previousSet.weight, weightUnit)}`
            : '—'}
      </span>

      {trackingType === 'reps_weight' && (
        <>
          <StepInput value={set.reps} onChange={v => onChange({ ...set, reps: v })}
            placeholder="Reps" step={1} min={0} max={999} />
          <StepInput value={displayWeight(set.weight)} onChange={v => onChange({ ...set, weight: storeWeight(v) })}
            placeholder={weightUnit} step={weightUnit === 'lbs' ? 2.5 : 1.25} min={0} max={999} />
        </>
      )}
      {trackingType === 'reps_only' && (
        <StepInput value={set.reps} onChange={v => onChange({ ...set, reps: v })}
          placeholder="Reps" step={1} min={0} max={999} />
      )}
      {trackingType === 'time' && (
        <StepInput value={set.duration} onChange={v => onChange({ ...set, duration: v })}
          placeholder="sec" step={5} min={0} max={7200} />
      )}

      <button
        onClick={onComplete}
        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-sm font-semibold ${
          set.completed
            ? 'bg-stone-900 text-white'
            : 'bg-stone-100 text-stone-400 hover:bg-stone-200 border border-stone-200'
        }`}
        aria-label={set.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        ✓
      </button>

      <button
        onClick={onRemove}
        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        aria-label="Remove set"
      >
        ✕
      </button>
    </div>
  )
}
