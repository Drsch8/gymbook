import { useState } from 'react'
import { nanoid } from '../utils/nanoid'
import type { ExerciseSet, SessionExercise, WeightUnit } from '../types'
import { SetRow } from './SetRow'

interface Props {
  item: SessionExercise
  weightUnit: WeightUnit
  previousSets?: ExerciseSet[]
  onChange: (updated: SessionExercise) => void
  onRemove: () => void
  onSetCompleted: () => void
}

function newSet(): ExerciseSet {
  return { id: nanoid(), completed: false }
}

export function ExerciseCard({ item, weightUnit, previousSets, onChange, onRemove, onSetCompleted }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const updateSet = (index: number, updated: ExerciseSet) =>
    onChange({ ...item, sets: item.sets.map((s, i) => (i === index ? updated : s)) })

  const removeSet = (index: number) =>
    onChange({ ...item, sets: item.sets.filter((_, i) => i !== index) })

  const completeSet = (index: number) => {
    const updated = { ...item.sets[index], completed: !item.sets[index].completed }
    onChange({ ...item, sets: item.sets.map((s, i) => (i === index ? updated : s)) })
    if (!item.sets[index].completed) onSetCompleted()
  }

  const addSet = () => {
    const prev = item.sets[item.sets.length - 1]
    const next: ExerciseSet = prev
      ? { ...newSet(), reps: prev.reps, weight: prev.weight, duration: prev.duration }
      : newSet()
    onChange({ ...item, sets: [...item.sets, next] })
  }

  const completedCount = item.sets.filter(s => s.completed).length

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
        <button className="flex items-center gap-2 flex-1 text-left" onClick={() => setCollapsed(c => !c)}>
          <span className="font-semibold text-stone-900">{item.exerciseName}</span>
          <span className="text-xs text-stone-400 ml-1">{completedCount}/{item.sets.length}</span>
          <svg className={`w-4 h-4 text-stone-300 ml-auto transition-transform ${collapsed ? '-rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button onClick={onRemove} className="ml-3 shrink-0 text-stone-300 hover:text-red-500 transition-colors text-xs">
          Remove
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 pb-4 pt-2 space-y-1">
          <div className="flex items-center gap-2 pb-1 text-xs text-stone-400 px-1">
            <span className="w-6 text-center shrink-0">#</span>
            <span className="w-14 text-center shrink-0 hidden sm:block">Prev</span>
            {item.trackingType === 'reps_weight' && (
              <><span className="flex-1 text-center">Reps</span><span className="flex-1 text-center">{weightUnit}</span></>
            )}
            {item.trackingType === 'reps_only' && <span className="flex-1 text-center">Reps</span>}
            {item.trackingType === 'time' && <span className="flex-1 text-center">Seconds</span>}
            <span className="w-8 shrink-0" /><span className="w-8 shrink-0" />
          </div>

          {item.sets.map((set, i) => (
            <SetRow
              key={set.id}
              set={set} index={i}
              trackingType={item.trackingType}
              weightUnit={weightUnit}
              previousSet={previousSets?.[i]}
              onChange={updated => updateSet(i, updated)}
              onRemove={() => removeSet(i)}
              onComplete={() => completeSet(i)}
            />
          ))}

          <button onClick={addSet}
            className="mt-2 w-full py-2 rounded-xl border border-dashed border-stone-200 text-stone-400 text-sm hover:border-stone-400 hover:text-stone-600 transition-colors">
            + Add set
          </button>
        </div>
      )}
    </div>
  )
}
