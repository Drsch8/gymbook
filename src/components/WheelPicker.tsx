import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ITEM_H  = 46
const VISIBLE = 5               // odd number of rows in the window
const WHEEL_H = ITEM_H * VISIBLE
const WHEEL_W = 132

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

// Full-screen overlay with a native scroll-snap wheel. The browser owns the
// physics (momentum, snap), so flicks and slow scrolls feel exactly like any
// other list. Tap outside to confirm; tap a number to jump to it.
export function WheelPicker({ rect, value, min, max, step, decimals, onClose }: Props) {
  const count = Math.floor((max - min) / step) + 1
  const initialIdx = clamp(Math.round((value - min) / step), 0, count - 1)
  const [centerIdx, setCenterIdx] = useState(initialIdx)
  const scrollRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef(initialIdx)

  useLayoutEffect(() => {
    scrollRef.current!.scrollTop = initialIdx * ITEM_H
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = () => {
    const idx = clamp(Math.round(scrollRef.current!.scrollTop / ITEM_H), 0, count - 1)
    if (idx !== centerRef.current) {
      centerRef.current = idx
      setCenterIdx(idx)
      if ('vibrate' in navigator) navigator.vibrate(4)
    }
  }

  const commit = () => {
    const idx = centerRef.current
    onClose(idx === initialIdx ? null : +(min + idx * step).toFixed(2))
  }

  const dark = document.documentElement.classList.contains('dark')
  const bandColor = dark ? '#57534e' : '#d6d3d1'
  const textColor = dark ? '#f5f5f4' : '#1c1917'
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

      {/* Selection band */}
      <div style={{
        position: 'fixed', left: 0, right: 0, zIndex: 41, pointerEvents: 'none',
        top: cy - ITEM_H / 2, height: ITEM_H,
        borderTop:    `1px solid ${bandColor}`,
        borderBottom: `1px solid ${bandColor}`,
      }} />

      {/* The wheel: a real scroll container with snap — native momentum physics */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar"
        style={{
          position: 'fixed', zIndex: 42,
          left: cx - WHEEL_W / 2, top: cy - WHEEL_H / 2,
          width: WHEEL_W, height: WHEEL_H,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          overscrollBehavior: 'contain',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 28%, black 72%, transparent)',
          maskImage: 'linear-gradient(to bottom, transparent, black 28%, black 72%, transparent)',
        }}
      >
        <div style={{ height: ITEM_H * ((VISIBLE - 1) / 2) }} />
        {Array.from({ length: count }, (_, i) => {
          const isCenter = i === centerIdx
          return (
            <div
              key={i}
              onClick={() => scrollRef.current!.scrollTo({ top: i * ITEM_H, behavior: 'smooth' })}
              style={{
                height: ITEM_H,
                scrollSnapAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'ui-monospace, monospace',
                fontVariantNumeric: 'tabular-nums',
                fontSize: isCenter ? 32 : 18,
                fontWeight: isCenter ? 700 : 400,
                opacity: isCenter ? 1 : 0.4,
                color: textColor,
                userSelect: 'none',
                transition: 'font-size 0.1s ease, opacity 0.1s ease',
              }}
            >
              {(min + i * step).toFixed(decimals)}
            </div>
          )
        })}
        <div style={{ height: ITEM_H * ((VISIBLE - 1) / 2) }} />
      </div>
    </>,
    document.body
  )
}
