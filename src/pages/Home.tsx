import { useNavigate } from 'react-router-dom'

export function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-full flex flex-col px-4 pt-safe">
      <div className="pt-14 pb-8">
        <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">GymBook</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">Track your training. Own your progress.</p>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/classes')}
          className="w-full bg-stone-900 dark:bg-stone-100 rounded-3xl px-6 py-8 text-left hover:bg-stone-800 dark:hover:bg-white active:scale-[0.98] transition-all"
        >
          <p className="text-2xl font-bold text-white dark:text-stone-900 mb-1">Classes</p>
          <p className="text-stone-400 dark:text-stone-500 text-sm">Strukturierte Programme & Trainingseinheiten</p>
        </button>

        <button
          onClick={() => navigate('/session/new')}
          className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-3xl px-6 py-8 text-left hover:border-stone-400 dark:hover:border-stone-500 active:scale-[0.98] transition-all"
        >
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">Training</p>
          <p className="text-stone-400 dark:text-stone-500 text-sm">Freies Training & eigene Übungen</p>
        </button>
      </div>
    </div>
  )
}
