import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadDraft, clearDraft } from '../utils/draft'

export function Home() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => loadDraft())

  const discard = () => { clearDraft(); setDraft(null) }

  const resume = () => {
    if (!draft) return
    if (draft.fogProgramId) {
      // Class session: pass only fogProgramId + method so NewSession knows it's a class
      // Exercises come from the draft, not from `repeat`
      navigate('/session/new', { state: { fogProgramId: draft.fogProgramId, method: draft.method } })
    } else {
      // Manual training: navigate without state (exercises come from draft)
      navigate('/session/new')
    }
  }

  const completedSets = draft
    ? draft.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
    : 0
  const totalSets = draft
    ? draft.exercises.reduce((n, e) => n + e.sets.length, 0)
    : 0

  return (
    <div className="min-h-full flex flex-col px-4 pt-safe">
      <div className="pt-14 pb-8">
        <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">GymBook</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">Track your training. Own your progress.</p>
      </div>

      <div className="flex flex-col gap-4">
        {draft && (
          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-3xl px-6 py-5">
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">In progress</p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight">
              {draft.displayName ?? (draft.fogProgramId ? draft.method : 'Free Training') ?? 'Session'}
            </p>
            <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">
              {completedSets}/{totalSets} sets · {draft.exercises.length} exercises
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={resume}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors"
              >
                Continue
              </button>
              <button
                onClick={discard}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500 text-sm font-medium hover:border-stone-400 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/classes')}
          className="w-full bg-stone-900 dark:bg-stone-100 rounded-3xl px-6 py-8 text-left hover:bg-stone-800 dark:hover:bg-white active:scale-[0.98] transition-all"
        >
          <p className="text-2xl font-bold text-white dark:text-stone-900 mb-1">Classes</p>
          <p className="text-stone-400 dark:text-stone-500 text-sm">Structured programs & workout sessions</p>
        </button>

        <button
          onClick={() => navigate('/session/new')}
          className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-3xl px-6 py-8 text-left hover:border-stone-400 dark:hover:border-stone-500 active:scale-[0.98] transition-all"
        >
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">Training</p>
          <p className="text-stone-400 dark:text-stone-500 text-sm">Free training & custom exercises</p>
        </button>
      </div>
    </div>
  )
}
