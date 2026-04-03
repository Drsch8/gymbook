import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExerciseSearch } from '../components/ExerciseSearch'
import { ExerciseCard } from '../components/ExerciseCard'
import { RestTimer } from '../components/RestTimer'
import { getLastSessionForExercise, getPreferences, saveSession } from '../db'
import { nanoid } from '../utils/nanoid'
import type { Exercise, ExerciseSet, SessionExercise, WeightUnit } from '../types'

function newSessionExercise(exercise: Exercise): SessionExercise {
  return {
    id: nanoid(),
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    trackingType: exercise.trackingType,
    sets: [{ id: nanoid(), completed: false }],
  }
}

export function NewSession() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState<SessionExercise[]>([])
  const [previousSets, setPreviousSets] = useState<Record<string, ExerciseSet[]>>({})
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [restSeconds, setRestSeconds] = useState(90)
  const [showSearch, setShowSearch] = useState(true)
  const [lastCompleted, setLastCompleted] = useState(0)
  const startedAt = useRef(new Date().toISOString())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPreferences().then(p => { setWeightUnit(p.weightUnit); setRestSeconds(p.restTimerDefault) })
  }, [])

  const addExercise = async (exercise: Exercise) => {
    const item = newSessionExercise(exercise)
    setExercises(prev => [...prev, item])
    setShowSearch(false)
    const prev = await getLastSessionForExercise(exercise.id)
    if (prev) {
      const prevEx = prev.exercises.find(e => e.exerciseId === exercise.id)
      if (prevEx) setPreviousSets(p => ({ ...p, [item.id]: prevEx.sets }))
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const updateExercise = (index: number, updated: SessionExercise) =>
    setExercises(prev => prev.map((e, i) => (i === index ? updated : e)))

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
    if (exercises.length <= 1) setShowSearch(true)
  }

  const finish = async () => {
    await saveSession({
      id: nanoid(),
      date: new Date().toISOString().slice(0, 10),
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      exercises,
    })
    navigate('/', { replace: true })
  }

  const totalCompleted = exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0)

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-stone-400 hover:text-stone-700 transition-colors text-sm">
          ← Back
        </button>
        <span className="text-sm text-stone-400 font-mono">{totalCompleted}/{totalSets} sets</span>
        <button
          onClick={finish}
          disabled={exercises.length === 0}
          className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          Finish
        </button>
      </header>

      <div className="flex-1 px-4 py-5 space-y-3 max-w-lg mx-auto w-full">
        {lastCompleted > 0 && (
          <div className="flex justify-center py-1">
            <RestTimer key={lastCompleted} defaultSeconds={restSeconds} />
          </div>
        )}

        {exercises.map((item, i) => (
          <ExerciseCard
            key={item.id}
            item={item}
            weightUnit={weightUnit}
            previousSets={previousSets[item.id]}
            onChange={updated => updateExercise(i, updated)}
            onRemove={() => removeExercise(i)}
            onSetCompleted={() => setLastCompleted(Date.now())}
          />
        ))}

        {showSearch ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
              {exercises.length === 0 ? 'Choose your first exercise' : 'Add exercise'}
            </p>
            <ExerciseSearch onSelect={addExercise} autoFocus={exercises.length === 0} />
          </div>
        ) : (
          <button
            onClick={() => { setShowSearch(true); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100) }}
            className="w-full py-3 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-sm hover:border-stone-400 hover:text-stone-600 bg-white transition-colors"
          >
            + Add Exercise
          </button>
        )}

        <div ref={bottomRef} className="h-8" />
      </div>
    </div>
  )
}
