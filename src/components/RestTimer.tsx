import { useRestTimer } from '../hooks/useRestTimer'

interface Props { defaultSeconds: number }

function pad(n: number) { return String(n).padStart(2, '0') }

export function RestTimer({ defaultSeconds }: Props) {
  const { remaining, running, start, stop } = useRestTimer(defaultSeconds)
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct = running ? (remaining / defaultSeconds) * 100 : 0

  if (!running && remaining === 0) {
    return (
      <button onClick={() => start()} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
        Start rest timer
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#e7e5e4" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none"
            stroke={pct < 20 ? '#ef4444' : '#1c1917'}
            strokeWidth="3"
            strokeDasharray="94.25"
            strokeDashoffset={94.25 - (94.25 * pct) / 100}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-stone-700">
          {pad(mins)}:{pad(secs)}
        </span>
      </div>
      <button onClick={stop} className="text-xs text-stone-400 hover:text-red-500 transition-colors">Skip</button>
    </div>
  )
}
