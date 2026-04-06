import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ExerciseSearch } from '../components/ExerciseSearch'
import { ExerciseCard } from '../components/ExerciseCard'
import { RestTimer } from '../components/RestTimer'
import { getLastSessionForExercise, getPreferences, getSessions, saveSession, advancePlanSession } from '../db'
import { nanoid } from '../utils/nanoid'
import { getPreset } from '../data/presets'
import type { Exercise, ExerciseSet, SessionExercise, WeightUnit } from '../types'
import type { PresetVariant } from '../data/presets'

const TITLE_CHIPS = ['Legs', 'Upper', 'Push', 'Pull', 'Core', 'Cardio', 'Full Body']

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
  const location = useLocation()
  const state = location.state as { repeat?: SessionExercise[]; name?: string; planSessionIndex?: number } | null
  const repeated = state?.repeat ?? []
  const planSessionIndex = state?.planSessionIndex
  const [exercises, setExercises] = useState<SessionExercise[]>(repeated)
  const [sessionName, setSessionName] = useState(state?.name ?? '')
  const [previousSets, setPreviousSets] = useState<Record<string, ExerciseSet[]>>({})
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [restSeconds, setRestSeconds] = useState(90)
  const [showSearch, setShowSearch] = useState(repeated.length === 0)
  const [lastCompleted, setLastCompleted] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(repeated[0]?.id ?? null)
  const [variantOptions, setVariantOptions] = useState<PresetVariant[] | null>(null)
  const [chipCounts, setChipCounts] = useState<Record<string, number>>({})
  const startedAt = useRef(new Date().toISOString())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPreferences().then(p => { setWeightUnit(p.weightUnit); setRestSeconds(p.restTimerDefault) })
  }, [])

  useEffect(() => {
    getSessions(500).then(sessions => {
      const counts: Record<string, number> = {}
      for (const s of sessions) {
        if (s.name && TITLE_CHIPS.includes(s.name)) {
          counts[s.name] = (counts[s.name] ?? 0) + 1
        }
      }
      setChipCounts(counts)
    })
  }, [])

  const addExercise = async (exercise: Exercise) => {
    const item = newSessionExercise(exercise)
    setExercises(prev => [...prev, item])
    setExpandedId(item.id) // collapse all others, open the new one
    setShowSearch(false)

    const prev = await getLastSessionForExercise(exercise.id)
    if (prev) {
      const prevEx = prev.exercises.find(e => e.exerciseId === exercise.id)
      if (prevEx) setPreviousSets(p => ({ ...p, [item.id]: prevEx.sets }))
    }

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
  }

  const updateExercise = (index: number, updated: SessionExercise) =>
    setExercises(prev => prev.map((e, i) => (i === index ? updated : e)))

  const removeExercise = (index: number) => {
    const removed = exercises[index]
    setExercises(prev => prev.filter((_, i) => i !== index))
    if (removed.id === expandedId) setExpandedId(null)
    if (exercises.length <= 1) setShowSearch(true)
  }

  const finish = async () => {
    await saveSession({
      id: nanoid(),
      name: sessionName.trim() || undefined,
      date: new Date().toISOString().slice(0, 10),
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      exercises,
    })
    if (planSessionIndex !== undefined) {
      await advancePlanSession()
    }
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
        {/* Session title */}
        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 space-y-2.5">
          <input
            type="text"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            placeholder="Session title (optional)"
            style={{ fontSize: '16px' }}
            className="w-full bg-transparent text-stone-900 placeholder-stone-400 font-semibold focus:outline-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {TITLE_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => {
                  const isActive = sessionName === chip
                  if (isActive) {
                    setSessionName('')
                    setVariantOptions(null)
                    if (exercises.length === 0) setShowSearch(true)
                  } else {
                    setSessionName(chip)
                    if (exercises.length === 0) {
                      const preset = getPreset(chip)
                      setVariantOptions(preset?.variants ?? null)
                      setShowSearch(false)
                    } else {
                      setVariantOptions(null)
                    }
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sessionName === chip
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {chip}{chipCounts[chip] ? ` (${chipCounts[chip]})` : ''}
              </button>
            ))}
          </div>
        </div>

        {variantOptions && (
          <div key={sessionName} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <p className="px-4 pt-3 pb-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">Choose a session</p>
            <div className="divide-y divide-stone-100">
              {variantOptions.map(variant => (
                <button
                  key={variant.name}
                  onClick={() => {
                    const items: SessionExercise[] = variant.exercises.map(ex => ({
                      id: nanoid(),
                      exerciseId: ex.exerciseId,
                      exerciseName: ex.exerciseName,
                      trackingType: ex.trackingType,
                      sets: ex.sets.map(s => ({ id: nanoid(), ...s, completed: false })),
                    }))
                    setExercises(items)
                    setExpandedId(items[0]?.id ?? null)
                    setShowSearch(false)
                    setVariantOptions(null)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-stone-900">{variant.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {variant.exercises.map(e => e.exerciseName).join(' · ')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

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
            collapsed={item.id !== expandedId}
            onToggle={() => setExpandedId(prev => prev === item.id ? null : item.id)}
            onChange={updated => updateExercise(i, updated)}
            onRemove={() => removeExercise(i)}
            onSetCompleted={() => setLastCompleted(Date.now())}
          />
        ))}

        {showSearch ? (
          <div ref={bottomRef} className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
              {exercises.length === 0 ? 'Choose your first exercise' : 'Add exercise'}
            </p>
            <ExerciseSearch onSelect={addExercise} autoFocus />
          </div>
        ) : (
          <button
            onClick={() => {
              setShowSearch(true)
              // Scroll after the search card + dropdown have rendered
              setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
            }}
            className="w-full py-3 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-sm hover:border-stone-400 hover:text-stone-600 bg-white transition-colors"
          >
            + Add Exercise
          </button>
        )}

        <div className="h-48" />
      </div>
    </div>
  )
}
