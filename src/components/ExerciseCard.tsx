import { useEffect, useRef } from 'react'
import { nanoid } from '../utils/nanoid'
import type { ExerciseSet, SessionExercise, WeightUnit } from '../types'
import { MethodTimer } from './MethodTimer'

const REVEAL_EX = 88
const ACCENT     = 'oklch(62% 0.19 35)'
const ACCENT_BG  = 'oklch(96% 0.03 45)'
const ACCENT_TXT = 'oklch(50% 0.19 35)'

const MACHINE_ALTS: [RegExp, string][] = [
  [/push-up/i, 'Chest Press Machine / Bench Press'],
  [/military press|overhead press/i, 'Shoulder Press Machine'],
  [/tricep dip|table tricep/i, 'Tricep Pushdown'],
  [/door pull-up/i, 'Lat Pulldown Machine'],
  [/door row/i, 'Cable Row / Rowing Machine'],
  [/pull-up/i, 'Lat Pulldown Machine'],
  [/towel bicep curl/i, 'Bicep Curl / Cable Machine'],
  [/inverted row/i, 'Cable Row / Rowing Machine'],
  [/squat|lunge/i, 'Leg Press'],
  [/romanian deadlift/i, 'Leg Curl Machine'],
  [/leg raise/i, 'Leg Raise Station'],
  [/swimmer|back extension/i, 'Back Extension Machine'],
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

interface Props {
  item: SessionExercise
  weightUnit: WeightUnit
  previousSets?: ExerciseSet[]
  collapsed: boolean
  onToggle: () => void
  onChange: (updated: SessionExercise) => void
  onRemove: () => void
  onSetCompleted: () => void
  onStartSetTimer?: (setIdx: number) => void
  method?: string
}

function StepBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-full bg-white dark:bg-stone-700 flex items-center justify-center text-xl font-bold transition-colors hover:bg-stone-50 dark:hover:bg-stone-600 active:scale-95"
      style={{ color: ACCENT }}
    >
      {children}
    </button>
  )
}

export function ExerciseCard({
  item, weightUnit, previousSets, collapsed, onToggle, onChange,
  onRemove, onSetCompleted, onStartSetTimer, method,
}: Props) {
  const isClassSession = !!method
  const timerOnly = method === 'Step Intervals' || method === 'Interval Sets' || method === 'High Intensity Sets'

  const completedCount = item.sets.filter(s => s.completed).length
  const allDone = completedCount === item.sets.length && item.sets.length > 0
  const currentIdx = item.sets.findIndex(s => !s.completed)
  const machineAlt = getMachineAlt(item.exerciseId, item.exerciseName)

  const lbsFactor = 2.20462
  const weightStep = weightUnit === 'lbs' ? 2.5 : 1.25

  const displayWeight = (kg: number | undefined) => {
    if (kg == null) return undefined
    return weightUnit === 'lbs' ? +(kg * lbsFactor).toFixed(1) : kg
  }
  const storeWeight = (display: number) =>
    weightUnit === 'lbs' ? +(display / lbsFactor).toFixed(2) : display

  const weightStr = (set: ExerciseSet) => {
    const w = displayWeight(set.weight)
    return w != null ? `${w}` : '—'
  }

  const completeSet = (index: number) => {
    const wasCompleted = item.sets[index].completed
    onChange({ ...item, sets: item.sets.map((s, i) => i === index ? { ...s, completed: !s.completed } : s) })
    if (!wasCompleted) onSetCompleted()
  }

  const stepReps = (index: number, delta: number) =>
    onChange({ ...item, sets: item.sets.map((s, i) => i !== index ? s : { ...s, reps: Math.max(0, (s.reps ?? 0) + delta) }) })

  const stepWeight = (index: number, delta: number) => {
    const cur = displayWeight(item.sets[index].weight) ?? 0
    const next = Math.max(0, +(cur + delta).toFixed(2))
    onChange({ ...item, sets: item.sets.map((s, i) => i !== index ? s : { ...s, weight: storeWeight(next) }) })
  }

  const stepDuration = (index: number, delta: number) =>
    onChange({ ...item, sets: item.sets.map((s, i) => i !== index ? s : { ...s, duration: Math.max(0, (s.duration ?? 0) + delta) }) })

  const addSet = () => {
    const prev = item.sets[item.sets.length - 1]
    const next: ExerciseSet = prev
      ? { ...newSet(), reps: prev.reps, weight: prev.weight, duration: prev.duration }
      : newSet()
    onChange({ ...item, sets: [...item.sets, next] })
  }

  // ── Swipe-to-delete on card header ────────────────────────────────────────────
  const slideRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLButtonElement>(null)
  const swipeXRef = useRef(0)

  const setSlideX = (x: number, animated: boolean) => {
    swipeXRef.current = x
    const el = slideRef.current
    if (!el) return
    el.style.transition = animated ? 'transform 0.22s ease' : 'none'
    el.style.transform = `translateX(${x}px)`
  }

  useEffect(() => {
    const header = headerRef.current
    if (!header || isClassSession) return
    const s = { startX: 0, startY: 0, dir: null as 'h' | 'v' | null, baseX: 0, active: false }
    const onStart = (e: TouchEvent) => {
      s.startX = e.touches[0].clientX; s.startY = e.touches[0].clientY
      s.dir = null; s.baseX = swipeXRef.current; s.active = true
      document.addEventListener('touchmove', onMove, { passive: false })
      document.addEventListener('touchend', onEnd, { passive: true })
    }
    const onMove = (e: TouchEvent) => {
      if (!s.active) return
      const dx = e.touches[0].clientX - s.startX
      const dy = e.touches[0].clientY - s.startY
      if (!s.dir) {
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6)
          s.dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
        return
      }
      if (s.dir === 'v') return
      e.preventDefault()
      setSlideX(Math.max(-REVEAL_EX, Math.min(0, s.baseX + dx)), false)
    }
    const onEnd = () => {
      if (!s.active) return
      s.active = false
      if (s.dir === 'h') setSlideX(swipeXRef.current < -REVEAL_EX / 2 ? -REVEAL_EX : 0, true)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
    }
    header.addEventListener('touchstart', onStart, { passive: true })
    return () => {
      header.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
    }
  }, [isClassSession])

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-700 transition-colors">
      <div
        ref={slideRef}
        className="flex"
        style={{ transform: 'translateX(0)', width: isClassSession ? undefined : `calc(100% + ${REVEAL_EX}px)` }}
      >
        <div className="flex-1 min-w-0 bg-white dark:bg-stone-800">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <button
            ref={headerRef}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-700 text-left"
            onClick={() => { if (swipeXRef.current !== 0) { setSlideX(0, true); return } onToggle() }}
          >
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
            <div className="flex items-center gap-2.5 shrink-0 ml-2">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono tabular-nums ${
                allDone
                  ? 'bg-stone-900 dark:bg-stone-300 text-white dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
              }`}>
                {completedCount}/{item.sets.length}
              </span>
              <svg className={`w-4 h-4 text-stone-300 dark:text-stone-600 transition-transform ${collapsed ? '-rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* ── Body ───────────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateRows: collapsed ? '0fr' : '1fr', transition: 'grid-template-rows 0.28s ease' }}>
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-3 space-y-2">

                {timerOnly && allDone ? (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-stone-500 dark:text-stone-400">Exercise completed</span>
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

                    {!timerOnly && item.sets.map((set, i) => {
                      const isDone    = set.completed
                      const isCurrent = !isDone && i === currentIdx

                      if (isDone) {
                        return (
                          <button
                            key={set.id}
                            onClick={() => completeSet(i)}
                            className="w-full flex items-center gap-3 py-2 px-1 opacity-50 hover:opacity-70 transition-opacity text-left"
                          >
                            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[10px]" style={{ background: ACCENT }}>
                              ✓
                            </span>
                            <span className="text-sm font-mono text-stone-500 dark:text-stone-400 line-through">
                              {item.trackingType === 'reps_weight' && `${set.reps ?? '—'} × ${weightStr(set)} ${weightUnit}`}
                              {item.trackingType === 'reps_only'   && `${set.reps ?? '—'} reps`}
                              {item.trackingType === 'time'        && `${set.duration ?? '—'} s`}
                            </span>
                          </button>
                        )
                      }

                      if (isCurrent) {
                        const prevSet = previousSets?.[i]
                        return (
                          <div key={set.id} className="rounded-2xl p-4 flex flex-col gap-3 dark:bg-stone-700/40" style={{ background: ACCENT_BG }}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: ACCENT_TXT }}>
                                Set {i + 1} · next
                              </span>
                              {prevSet && (
                                <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                                  prev:{' '}
                                  {item.trackingType === 'reps_weight' && `${prevSet.reps ?? '—'} × ${displayWeight(prevSet.weight) ?? '—'}`}
                                  {item.trackingType === 'reps_only'   && `${prevSet.reps ?? '—'} reps`}
                                  {item.trackingType === 'time'        && `${prevSet.duration ?? '—'} s`}
                                </span>
                              )}
                            </div>

                            {item.trackingType === 'reps_weight' && (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <StepBtn onClick={() => stepReps(i, -1)}>–</StepBtn>
                                    <span className="font-mono text-2xl font-bold text-stone-900 dark:text-stone-100 min-w-[2.5rem] text-center tabular-nums">
                                      {set.reps ?? '—'}
                                    </span>
                                    <StepBtn onClick={() => stepReps(i, 1)}>+</StepBtn>
                                  </div>
                                  <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">reps</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <StepBtn onClick={() => stepWeight(i, -weightStep)}>–</StepBtn>
                                    <span className="font-mono text-2xl font-bold text-stone-900 dark:text-stone-100 min-w-[3.5rem] text-center tabular-nums">
                                      {weightStr(set)}
                                    </span>
                                    <StepBtn onClick={() => stepWeight(i, weightStep)}>+</StepBtn>
                                  </div>
                                  <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">{weightUnit}</span>
                                </div>
                              </div>
                            )}

                            {item.trackingType === 'reps_only' && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <StepBtn onClick={() => stepReps(i, -1)}>–</StepBtn>
                                  <span className="font-mono text-2xl font-bold text-stone-900 dark:text-stone-100 min-w-[2.5rem] text-center tabular-nums">
                                    {set.reps ?? '—'}
                                  </span>
                                  <StepBtn onClick={() => stepReps(i, 1)}>+</StepBtn>
                                </div>
                                <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">reps</span>
                              </div>
                            )}

                            {item.trackingType === 'time' && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <StepBtn onClick={() => stepDuration(i, -5)}>–</StepBtn>
                                  <span className="font-mono text-2xl font-bold text-stone-900 dark:text-stone-100 min-w-[3rem] text-center tabular-nums">
                                    {set.duration ?? '—'}
                                  </span>
                                  <StepBtn onClick={() => stepDuration(i, 5)}>+</StepBtn>
                                </div>
                                <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">sec</span>
                              </div>
                            )}

                            <div className="flex gap-2">
                              {item.trackingType === 'time' && onStartSetTimer && (
                                <button
                                  onClick={() => onStartSetTimer(i)}
                                  disabled={!set.duration}
                                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-600 disabled:opacity-30 transition-colors"
                                >
                                  ▶ Start
                                </button>
                              )}
                              <button
                                onClick={() => completeSet(i)}
                                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors active:brightness-90"
                                style={{ background: ACCENT }}
                              >
                                {item.trackingType === 'reps_weight' && `Log ${set.reps ?? '—'} × ${weightStr(set)} ${weightUnit}`}
                                {item.trackingType === 'reps_only'   && `Log ${set.reps ?? '—'} reps`}
                                {item.trackingType === 'time'        && 'Log set'}
                              </button>
                            </div>
                          </div>
                        )
                      }

                      // Future set
                      return (
                        <div key={set.id} className="flex items-center gap-3 py-2 px-1 opacity-45">
                          <span className="w-5 h-5 rounded-full border-2 border-dashed border-stone-300 dark:border-stone-600 shrink-0" />
                          <span className="text-sm font-mono text-stone-500 dark:text-stone-400">
                            Set {i + 1} ·{' '}
                            {item.trackingType === 'reps_weight' && `${set.reps ?? '—'} × ${weightStr(set)} ${weightUnit}`}
                            {item.trackingType === 'reps_only'   && `${set.reps ?? '—'} reps`}
                            {item.trackingType === 'time'        && `${set.duration ?? '—'} s`}
                          </span>
                        </div>
                      )
                    })}

                    {!method && (
                      <button
                        onClick={addSet}
                        className="mt-1 w-full py-2 rounded-xl border border-dashed border-stone-200 dark:border-stone-600 text-stone-400 dark:text-stone-500 text-sm hover:border-stone-400 dark:hover:border-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                      >
                        + Add set
                      </button>
                    )}

                    {timerOnly && (
                      <button
                        onClick={() => completeSet(0)}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                      >
                        Complete exercise
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Delete zone */}
        {!isClassSession && (
          <button
            className="flex-shrink-0 flex items-center justify-center bg-red-500 text-white text-sm font-semibold"
            style={{ width: REVEAL_EX }}
            onClick={() => { setSlideX(0, true); onRemove() }}
            aria-label="Remove exercise"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
