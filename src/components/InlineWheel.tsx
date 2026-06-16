import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

// Compact, directly-scrollable number wheel that lives inline in a set row —
// no tap-to-open. Native CSS scroll-snap owns the momentum/physics. Each item
// is scaled/faded as a *continuous* function of its distance from the centre
// (like the iOS drum), driven imperatively so scrolling never re-renders React.

const ITEM_H  = 26
const VISIBLE = 3                 // odd: one centre row + one above/below
const H       = ITEM_H * VISIBLE
const PAD     = (ITEM_H * (VISIBLE - 1)) / 2

interface Props {
  value: number | undefined
  onChange: (v: number) => void
  step: number
  max: number
  min?: number
  disabled?: boolean
  active?: boolean                // mount the heavy option list only when the card is open
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// Visual emphasis purely from distance-to-centre — no discrete "selected" flip.
function styleSpan(span: HTMLElement, dist: number) {
  const d = Math.min(dist, 2.2)
  span.style.transform = `scale(${Math.max(0.55, 1 - 0.34 * d).toFixed(3)})`
  span.style.opacity   = Math.max(0.18, 1 - 0.5 * d).toFixed(3)
}

export function InlineWheel({ value, onChange, step, max, min = 0, disabled, active = true }: Props) {
  const decimals = (step.toString().split('.')[1] ?? '').length
  const count = Math.floor((max - min) / step) + 1
  const options = useMemo(
    () => Array.from({ length: count }, (_, i) => +(min + i * step).toFixed(4)),
    [count, min, step],
  )
  const idxOf = (v: number | undefined) => clamp(Math.round(((v ?? min) - min) / step), 0, count - 1)

  const scrollRef = useRef<HTMLDivElement>(null)
  const indexRef  = useRef(idxOf(value))    // last integer index (haptics + commit)
  const styledRef = useRef<Set<number>>(new Set())
  const rafRef    = useRef(0)
  const settleRef = useRef<ReturnType<typeof setTimeout>>()
  const [ariaIdx, setAriaIdx] = useState(indexRef.current)

  // Paint the scale/opacity for the window of items around the live scroll centre.
  const paint = () => {
    const el = scrollRef.current
    if (!el) return
    const c  = el.scrollTop / ITEM_H               // fractional centre index
    const lo = Math.max(0, Math.floor(c) - 2)
    const hi = Math.min(count - 1, Math.ceil(c) + 2)
    for (const idx of styledRef.current) {
      if (idx < lo || idx > hi) {
        const span = el.children[idx + 1]?.firstElementChild as HTMLElement | undefined
        if (span) styleSpan(span, 3)
      }
    }
    const next = new Set<number>()
    for (let i = lo; i <= hi; i++) {
      const span = el.children[i + 1]?.firstElementChild as HTMLElement | undefined
      if (span) styleSpan(span, Math.abs(i - c))
      next.add(i)
    }
    styledRef.current = next
  }

  // Position on the current value + paint before the browser shows the frame.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = indexRef.current * ITEM_H
    styledRef.current = new Set()
    paint()
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  // Follow external value changes (e.g. copied from the previous session).
  useEffect(() => {
    const want = idxOf(value)
    if (want !== indexRef.current) {
      indexRef.current = want
      setAriaIdx(want)
      const el = scrollRef.current
      if (el) { el.scrollTop = want * ITEM_H; paint() }
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const onScroll = () => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => { rafRef.current = 0; paint() })
    }
    const i = clamp(Math.round(scrollRef.current!.scrollTop / ITEM_H), 0, count - 1)
    if (i !== indexRef.current) {
      indexRef.current = i
      if ('vibrate' in navigator) navigator.vibrate(3)
    }
    clearTimeout(settleRef.current)
    settleRef.current = setTimeout(() => {
      const v = options[indexRef.current]
      setAriaIdx(indexRef.current)
      if (v !== value) onChange(v)
    }, 110)
  }

  // Static, lightweight rendering for locked or collapsed rows.
  if (disabled || !active) {
    return (
      <div className="relative flex-1 min-w-0 flex items-center justify-center" style={{ height: H }}>
        <span
          className={`font-mono tabular-nums leading-none ${disabled ? 'text-stone-300 dark:text-stone-600' : 'text-stone-900 dark:text-stone-100'}`}
          style={{ fontSize: 21, fontWeight: 600 }}
        >
          {value == null ? '–' : value.toFixed(decimals)}
        </span>
      </div>
    )
  }

  return (
    <div
      className="relative flex-1 min-w-0"
      style={{ height: H }}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={options[ariaIdx]}
    >
      {/* Selection band sitting behind the centre value */}
      <div
        className="absolute inset-x-1 rounded-lg bg-stone-100 dark:bg-stone-700/50 pointer-events-none"
        style={{ top: PAD, height: ITEM_H }}
      />
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="no-scrollbar h-full overflow-y-scroll"
        style={{
          scrollSnapType: 'y mandatory',
          overscrollBehavior: 'contain',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 32%, #000 68%, transparent)',
          maskImage: 'linear-gradient(to bottom, transparent, #000 32%, #000 68%, transparent)',
        }}
      >
        <div style={{ height: PAD }} />
        {options.map((o, i) => (
          <div key={i} style={{ height: ITEM_H, scrollSnapAlign: 'center' }} className="flex items-center justify-center">
            <span
              className="font-mono tabular-nums leading-none text-stone-900 dark:text-stone-100"
              style={{ fontSize: 21, fontWeight: 600, display: 'inline-block', opacity: 0.18, transform: 'scale(0.55)' }}
            >
              {o.toFixed(decimals)}
            </span>
          </div>
        ))}
        <div style={{ height: PAD }} />
      </div>
    </div>
  )
}
