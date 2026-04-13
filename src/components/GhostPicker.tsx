import { useEffect, useReducer, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { dragState } from '../utils/dragState'
import type { DragInfo } from '../utils/dragState'

const OFFSETS = [-2, -1, 0, 1, 2]
const GAP     = 46   // px between item centres (must match ITEM_H)
const ITEM_H  = 46
const FADE_MS = 160

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

// All visual properties are continuous functions of fractional distance from centre.
// dist = 0  → selected item sitting exactly in the band
// dist = 1  → one step away
// dist = 2  → two steps away (edge of the visible range)
function distOpacity(d: number)  { return d <= 1 ? lerp(1, 0.32, d)  : lerp(0.32, 0.08, d - 1) }
function distFontSize(d: number) { return d <= 1 ? lerp(44, 20, d)   : lerp(20, 13, d - 1) }
function distBlur(d: number)     { return d <= 1 ? lerp(0, 1.2, d)   : lerp(1.2, 2.5, d - 1) }

function formatParts(v: number, decimalPlaces: number): { int: string; dec: string } {
  const fixed = v.toFixed(decimalPlaces)
  const dot   = fixed.indexOf('.')
  if (dot === -1) return { int: fixed, dec: '' }
  return { int: fixed.slice(0, dot), dec: fixed.slice(dot) }
}

export function GhostPicker() {
  const [, tick]            = useReducer(n => n + 1, 0)
  const [fading, setFading] = useState(false)
  // Persist the last known state so we can keep rendering while fading out
  const snapshotRef = useRef<NonNullable<DragInfo> | null>(null)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return dragState.subscribe(() => {
      const s = dragState.get()
      if (s !== null) {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
        snapshotRef.current = s
        setFading(false)
        tick()
      } else {
        // Drag ended: start CSS fade-out, then unmount after it completes
        setFading(true)
        timerRef.current = setTimeout(() => {
          snapshotRef.current = null
          tick()
        }, FADE_MS + 40)
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const s = snapshotRef.current
  if (!s) return null

  const { rect, value, step, rawSteps } = s
  const fraction      = rawSteps - Math.round(rawSteps) // in [-0.5, 0.5)
  const cx            = rect.left + rect.width / 2
  const cy            = rect.top  + rect.height / 2
  const dark          = document.documentElement.classList.contains('dark')
  const decimalPlaces = (step.toString().split('.')[1] ?? '').length
  const bandColor     = dark ? '#57534e' : '#d6d3d1'
  // Single text colour for all items — opacity + size convey which is selected,
  // avoiding the "colour jump" that happened when the highlighted item left the band
  const textColor     = dark ? '#f5f5f4' : '#1c1917'
  const alpha         = fading ? 0 : 1
  const fadeTrans     = `opacity ${FADE_MS}ms ease`

  return createPortal(
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 40, pointerEvents: 'none',
        background: dark ? 'rgba(28,25,23,0.55)' : 'rgba(250,250,249,0.72)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        opacity: alpha,
        transition: fadeTrans,
      }} />

      {/* Selection band */}
      <div style={{
        position: 'fixed', left: 0, right: 0, zIndex: 41, pointerEvents: 'none',
        top: cy - GAP / 2, height: GAP,
        borderTop:    `1px solid ${bandColor}`,
        borderBottom: `1px solid ${bandColor}`,
        opacity: alpha,
        transition: fadeTrans,
      }} />

      {/*
        Number items live inside a fixed full-screen container.
        The container owns the fade-out transition (opacity → 0 on drag end).
        Individual items change their own opacity/size instantly each rAF frame
        (no per-item transition) so the scroll feels immediate, not lagged.
        Children use position:absolute — the container is inset:0 so (0,0) is
        the viewport origin, giving the same result as position:fixed without
        the stacking-context complications of opacity on fixed descendants.
      */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 42, pointerEvents: 'none',
        opacity: alpha,
        transition: fadeTrans,
      }}>
        {OFFSETS.map(offset => {
          const raw = value + offset * step
          if (raw < 0) return null
          const { int: intPart, dec: decPart } = formatParts(raw, decimalPlaces)
          const yPos = cy + (offset - fraction) * GAP
          const dist = Math.abs(offset - fraction)
          const blur = distBlur(dist)
          return (
            <div key={offset} style={{
              position: 'absolute',
              left: 0, right: 0,
              top: yPos - ITEM_H / 2, height: ITEM_H,
              display: 'flex', alignItems: 'center',
              fontFamily: 'ui-monospace, monospace',
              fontSize: distFontSize(dist),
              // Bold only for the snapped-value item so the selected number
              // reads as heavier than its neighbours at all times
              fontWeight: offset === 0 ? 700 : 400,
              opacity: distOpacity(dist),
              filter: blur > 0 ? `blur(${blur}px)` : undefined,
              color: textColor,
              userSelect: 'none',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {/* Decimal point aligned at cx — matches NumCell's 50%-split layout */}
              <div style={{ width: cx, flexShrink: 0, textAlign: 'right' }}>{intPart}</div>
              <div style={{ flex: 1, textAlign: 'left' }}>{decPart}</div>
            </div>
          )
        })}
      </div>
    </>,
    document.body
  )
}
