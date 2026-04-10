import { nanoid } from '../utils/nanoid'
import type { ExerciseSet, SessionExercise, WeightUnit } from '../types'
import { SetRow } from './SetRow'
import { MethodTimer } from './MethodTimer'

interface Props {
  item: SessionExercise
  weightUnit: WeightUnit
  previousSets?: ExerciseSet[]
  collapsed: boolean
  onToggle: () => void
  onChange: (updated: SessionExercise) => void
  onRemove: () => void
  onSetCompleted: () => void
  method?: string
}

// Machine alternatives for fog (bodyweight) exercises
const MACHINE_ALTS: [RegExp, string][] = [
  [/liegestütz/i, 'Brust-Press-Maschine / Bankdrücken'],
  [/military press|überkopfpresse/i, 'Schulterdrücken-Maschine'],
  [/trizepsdip|trizepsstrecker/i, 'Trizeps-Pushdown'],
  [/türklimmzug/i, 'Latzug-Maschine'],
  [/türziehen/i, 'Rudermaschine / Kabelzug'],
  [/klimmzug/i, 'Latzug-Maschine'],
  [/curl mit handtuch/i, 'Bizeps-Curl / Kabelzug'],
  [/umgekehrtes bankdrücken/i, 'Kabelrudern / Rudermaschine'],
  [/kniebeuge|ausfallschritt/i, 'Beinpresse'],
  [/rumänisches kreuzheben/i, 'Beinbeuger-Maschine'],
  [/beinheber/i, 'Beinhebestation'],
  [/schwimmer|rückenheber/i, 'Rückenstrecker-Maschine'],
]

function getMachineAlt(exerciseId: string, exerciseName: string): string | null {
  if (!exerciseId.startsWith('fog_')) return null
  for (const [pattern, machine] of MACHINE_ALTS) {
    if (pattern.test(exerciseName)) return machine
  }
  return null
}

function newSet(): ExerciseSet {
  return { id: nanoid(), completed: false }
}

export function ExerciseCard({ item, weightUnit, previousSets, collapsed, onToggle, onChange, onRemove, onSetCompleted, method }: Props) {
  const isClassSession = !!method
  // Methods that replace standard set rows with a dedicated timer UI
  const timerOnly = method === 'Stufenintervalle' || method === 'Intervallsätze' || method === 'Hochintensitätssätze'
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
  const allDone = completedCount === item.sets.length && item.sets.length > 0
  const machineAlt = getMachineAlt(item.exerciseId, item.exerciseName)

  return (
    <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden transition-colors">
      <button
        className="w-full flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-700 text-left"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 min-w-0">
          {allDone && (
            <span className="shrink-0 w-4 h-4 rounded-full bg-stone-900 dark:bg-stone-300 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white dark:text-stone-900" fill="none" viewBox="0 0 10 8" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M1 4l3 3 5-6" />
              </svg>
            </span>
          )}
          <div className="min-w-0">
            <span className={`font-semibold truncate block ${allDone ? 'text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>
              {item.exerciseName}
            </span>
            {machineAlt && (
              <span className="text-[10px] text-stone-400 dark:text-stone-500 block leading-tight mt-0.5">
                {machineAlt}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">{completedCount}/{item.sets.length}</span>
          {!isClassSession && (
            <button
              onClick={e => { e.stopPropagation(); onRemove() }}
              className="text-stone-300 dark:text-stone-600 hover:text-red-500 transition-colors text-xs"
            >
              Remove
            </button>
          )}
          <svg className={`w-4 h-4 text-stone-300 dark:text-stone-600 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: collapsed ? '0fr' : '1fr',
          transition: 'grid-template-rows 0.28s ease',
        }}
      >
      <div className="overflow-hidden">
        <div className="px-4 pb-4 pt-2 space-y-2">
          {/* Locked state: timerOnly exercise already completed */}
          {timerOnly && allDone ? (
            <div className="flex items-center justify-between py-2 px-1">
              <span className="text-sm text-stone-500 dark:text-stone-400">Übung abgeschlossen</span>
              <button
                onClick={() => completeSet(0)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
              >
                Repeat
              </button>
            </div>
          ) : (
            <>
              {method && <MethodTimer method={method} />}

              {!timerOnly && (
                <div className="sets-list space-y-1">
                  <div className="flex items-center gap-2 pb-1 text-xs text-stone-400 dark:text-stone-500 px-1">
                    <span className="w-5 text-center shrink-0">#</span>
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

                  {!method && (
                    <button onClick={addSet}
                      className="mt-2 w-full py-2 rounded-xl border border-dashed border-stone-200 dark:border-stone-600 text-stone-400 dark:text-stone-500 text-sm hover:border-stone-400 dark:hover:border-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                      + Add set
                    </button>
                  )}
                </div>
              )}

              {timerOnly && (
                <button
                  onClick={() => completeSet(0)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                >
                  Übung abschließen
                </button>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
