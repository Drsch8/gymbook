import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

// Compact, directly-scrollable number wheel that lives inline in a set row —
// no tap-to-open. Native CSS scroll-snap owns the momentum/physics; we only
// track the centred index for the highlight and commit on settle.

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

export function InlineWheel({ value, onChange, step, max, min = 0, disabled, active = true }: Props) {
  const decimals = (step.toString().split('.')[1] ?? '').length
  const count = Math.floor((max - min) / step) + 1
  const options = useMemo(
    () => Array.from({ length: count }, (_, i) => +(min + i * step).toFixed(4)),
    [count, min, step],
  )
  const idxOf = (v: number | undefined) => clamp(Math.round(((v ?? min) - min) / step), 0, count - 1)

  const scrollRef  = useRef<HTMLDivElement>(null)
  const centerRef  = useRef(idxOf(value))
  const settleRef  = useRef<ReturnType<typeof setTimeout>>()
  const [center, setCenter] = useState(centerRef.current)

  // Position the wheel on the current value before paint.
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = centerRef.current * ITEM_H
  }, [active])

  // Follow external value changes (e.g. copied from the previous session) without fighting the user.
  useEffect(() => {
    const want = idxOf(value)
    if (want !== centerRef.current) {
      centerRef.current = want
      setCenter(want)
      if (scrollRef.current) scrollRef.current.scrollTop = want * ITEM_H
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const onScroll = () => {
    const i = clamp(Math.round(scrollRef.current!.scrollTop / ITEM_H), 0, count - 1)
    if (i !== centerRef.current) {
      centerRef.current = i
      setCenter(i)
      if ('vibrate' in navigator) navigator.vibrate(3)
    }
    clearTimeout(settleRef.current)
    settleRef.current = setTimeout(() => {
      const v = options[centerRef.current]
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
      aria-valuenow={options[center]}
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
        {options.map((o, i) => {
          const sel = i === center
          const near = Math.abs(i - center) === 1
          return (
            <div key={i} style={{ height: ITEM_H, scrollSnapAlign: 'center' }} className="flex items-center justify-center">
              <span
                className="font-mono tabular-nums leading-none text-stone-900 dark:text-stone-100"
                style={{
                  fontSize: sel ? 21 : 13,
                  fontWeight: sel ? 700 : 500,
                  opacity: sel ? 1 : near ? 0.4 : 0.2,
                  transition: 'font-size 0.12s ease, opacity 0.12s ease',
                }}
              >
                {o.toFixed(decimals)}
              </span>
            </div>
          )
        })}
        <div style={{ height: PAD }} />
      </div>
    </div>
  )
}
