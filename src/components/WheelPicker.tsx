import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Picker from 'react-mobile-picker'

const ITEM_H  = 44
const WHEEL_H = 220
const WHEEL_W = 148

interface Props {
  rect: DOMRect                 // cell rect — the wheel anchors to its centre
  value: number
  min: number
  max: number
  step: number
  decimals: number
  // null = closed without changing the value
  onClose: (committed: number | null) => void
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

// Anchored overlay around react-mobile-picker — the package implements the
// real iOS drum (inertia, rubber-banding, 3D item rotation). Tap outside to
// confirm and close.
export function WheelPicker({ rect, value, min, max, step, decimals, onClose }: Props) {
  const options = useMemo(() => {
    const count = Math.floor((max - min) / step) + 1
    return Array.from({ length: count }, (_, i) => (min + i * step).toFixed(decimals))
  }, [min, max, step, decimals])

  const initial = options[clamp(Math.round((value - min) / step), 0, options.length - 1)]
  const [picked, setPicked] = useState({ v: initial })
  const pickedRef = useRef(initial)

  const handleChange = (next: { v: string }) => {
    pickedRef.current = next.v
    setPicked(next)
    if ('vibrate' in navigator) navigator.vibrate(4)
  }

  const commit = () => {
    onClose(pickedRef.current === initial ? null : parseFloat(pickedRef.current))
  }

  const dark = document.documentElement.classList.contains('dark')
  const bandColor = dark ? 'rgba(245,245,244,0.08)' : 'rgba(28,25,23,0.05)'
  const cx = clamp(rect.left + rect.width / 2, WHEEL_W / 2 + 8, window.innerWidth  - WHEEL_W / 2 - 8)
  const cy = clamp(rect.top  + rect.height / 2, WHEEL_H / 2 + 8, window.innerHeight - WHEEL_H / 2 - 8)

  return createPortal(
    <>
      {/* Backdrop — tap to confirm & close */}
      <div
        onPointerDown={commit}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: dark ? 'rgba(28,25,23,0.55)' : 'rgba(250,250,249,0.72)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />

      <div
        style={{
          position: 'fixed', zIndex: 41,
          left: cx - WHEEL_W / 2, top: cy - WHEEL_H / 2,
          width: WHEEL_W, height: WHEEL_H,
        }}
      >
        {/* Selection band behind the centre row */}
        <div style={{
          position: 'absolute', left: -6, right: -6, pointerEvents: 'none',
          top: (WHEEL_H - ITEM_H) / 2, height: ITEM_H,
          borderRadius: 12,
          background: bandColor,
        }} />

        <Picker
          value={picked}
          onChange={handleChange}
          height={WHEEL_H}
          itemHeight={ITEM_H}
          wheelMode="natural"
        >
          <Picker.Column name="v">
            {options.map(o => (
              <Picker.Item key={o} value={o}>
                {({ selected }) => (
                  <span
                    className="font-mono tabular-nums select-none"
                    style={{
                      fontSize: selected ? 30 : 19,
                      fontWeight: selected ? 700 : 400,
                      opacity: selected ? 1 : 0.45,
                      color: dark ? '#f5f5f4' : '#1c1917',
                      transition: 'font-size 0.12s ease, opacity 0.12s ease',
                    }}
                  >
                    {o}
                  </span>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
        </Picker>
      </div>
    </>,
    document.body
  )
}
