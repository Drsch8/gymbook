import { useRef, useState } from 'react'

interface Props {
  value: number | undefined
  onChange: (v: number | undefined) => void
  placeholder: string
  step?: number
  min?: number
  max?: number
}

export function StepInput({ value, onChange, placeholder, step = 1, min = 0, max = 9999 }: Props) {
  const [editing, setEditing] = useState(false)
  const touchStartY = useRef<number | null>(null)
  const accumulated = useRef(0)

  const clamp = (v: number) => Math.max(min, Math.min(max, v))

  const increment = (delta: number) => {
    const current = value ?? 0
    onChange(clamp(+(current + delta).toFixed(2)))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    accumulated.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    e.preventDefault()
    const dy = touchStartY.current - e.touches[0].clientY
    const steps = Math.floor(dy / 8) - accumulated.current
    if (steps !== 0) {
      accumulated.current += steps
      increment(steps * step)
    }
  }

  const handleTouchEnd = () => { touchStartY.current = null }

  if (editing) {
    return (
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        type="number"
        inputMode="decimal"
        min={min} max={max} step={step}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value === '' ? undefined : +e.target.value)}
        onBlur={() => setEditing(false)}
        className="flex-1 min-w-0 bg-white border-2 border-stone-900 rounded-xl px-2 py-2 text-sm text-center text-stone-900 font-mono focus:outline-none"
      />
    )
  }

  return (
    <div className="flex-1 min-w-0 flex items-center rounded-xl border border-stone-200 bg-white overflow-hidden select-none touch-none">
      <button
        type="button"
        onPointerDown={() => increment(-step)}
        className="px-2.5 py-2 text-stone-400 hover:text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition-colors text-base leading-none shrink-0"
        aria-label="Decrease"
      >
        −
      </button>
      <div
        className="flex-1 text-center py-2 text-sm font-mono text-stone-900 cursor-text"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setEditing(true)}
      >
        {value != null ? value : <span className="text-stone-400">{placeholder}</span>}
      </div>
      <button
        type="button"
        onPointerDown={() => increment(step)}
        className="px-2.5 py-2 text-stone-400 hover:text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition-colors text-base leading-none shrink-0"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}
