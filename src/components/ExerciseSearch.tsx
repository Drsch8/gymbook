import { useEffect, useRef, useState } from 'react'
import { searchExercises } from '../data/exercises'
import type { Exercise } from '../types'

interface Props {
  onSelect: (exercise: Exercise) => void
  autoFocus?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  strength:    'Strength',
  bodyweight:  'Bodyweight',
  cardio:      'Cardio',
  flexibility: 'Flexibility',
}

export function ExerciseSearch({ onSelect, autoFocus }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Exercise[]>(() => searchExercises(''))
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 50)
  }, [autoFocus])

  useEffect(() => {
    setResults(searchExercises(query))
    setHighlighted(0)
  }, [query])

  const select = (exercise: Exercise) => {
    setQuery('')
    setOpen(false)
    onSelect(exercise)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true)
      return
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)); break
      case 'ArrowUp':   e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); break
      case 'Enter':     e.preventDefault(); if (results[highlighted]) select(results[highlighted]); break
      case 'Escape':    setOpen(false); break
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search exercise…"
          className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-900/10 transition"
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((ex, i) => (
            <li
              key={ex.id}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors text-sm ${
                i === highlighted ? 'bg-stone-100' : 'hover:bg-stone-50'
              }`}
              onMouseDown={() => select(ex)}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span className="font-medium text-stone-900">{ex.name}</span>
              <span className="text-xs text-stone-400 ml-2 shrink-0">{CATEGORY_LABELS[ex.category]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
