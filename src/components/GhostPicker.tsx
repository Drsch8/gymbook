import { useEffect, useReducer, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { dragState } from '../utils/dragState'
import type { DragInfo } from '../utils/dragState'

const OFFSETS    = [-2, -1,  0,  1,  2]
const GAP        = 46
const FONT_SIZES = [13, 21, 44, 21, 13]
const OPACITIES  = [0.16, 0.42, 1, 0.42, 0.16]
const BLURS      = [2.5, 1.2, 0, 1.2, 2.5]
const WEIGHTS    = [400, 400, 700, 400, 400]
const ITEM_H     = 46
const FADE_MS    = 160

function formatParts(v: number, decimalPlaces: number): { int: string; dec: string } {
  const fixed = v.toFixed(decimalPlaces)
  const dot   = fixed.indexOf('.')
  if (dot === -1) return { int: fixed, dec: '' }
  return { int: fixed.slice(0, dot), dec: fixed.slice(dot) }
}

export function GhostPicker() {
  const [, tick]      = useReducer(n => n + 1, 0)
  const [fading, setFading] = useState(false)
  // Hold the last non-null snapshot so we can keep rendering during fade-out
  const snapshotRef   = useRef<NonNullable<DragInfo> | null>(null)
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return dragState.subscribe(() => {
      const s = dragState.get()
      if (s !== null) {
        // New drag data — cancel any in-progress fade-out and show immediately
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
        snapshotRef.current = s
        setFading(false)
        tick()
      } else {
        // Drag ended — start fade-out, then unmount after transition completes
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
  const fraction      = rawSteps - Math.round(rawSteps)   // [-0.5, 0.5]
  const cx            = rect.left + rect.width / 2
  const cy            = rect.top  + rect.height / 2
  const dark          = document.documentElement.classList.contains('dark')
  const decimalPlaces = (step.toString().split('.')[1] ?? '').length
  const bandColor     = dark ? '#57534e' : '#d6d3d1'

  // alpha drives the fade-out: all elements share this via inline-style
  // so the CSS engine handles the smooth transition (no JS animation loop)
  const alpha = fading ? 0 : 1
  const trans = `opacity ${FADE_MS}ms ease`

  return createPortal(
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 40, pointerEvents: 'none',
        background: dark ? 'rgba(28,25,23,0.55)' : 'rgba(250,250,249,0.72)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        opacity: alpha,
        transition: trans,
      }} />

      {/* Selection band */}
      <div style={{
        position: 'fixed', left: 0, right: 0, zIndex: 41, pointerEvents: 'none',
        top: cy - GAP / 2, height: GAP,
        borderTop:    `1px solid ${bandColor}`,
        borderBottom: `1px solid ${bandColor}`,
        opacity: alpha,
        transition: trans,
      }} />

      {/* Ghost numbers */}
      {OFFSETS.map((offset, i) => {
        const raw = value + offset * step
        if (raw < 0) return null
        const { int: intPart, dec: decPart } = formatParts(raw, decimalPlaces)
        const yPos = cy + (offset - fraction) * GAP
        return (
          <div key={offset} style={{
            position: 'fixed',
            left: 0, right: 0,
            top: yPos - ITEM_H / 2, height: ITEM_H,
            display: 'flex', alignItems: 'center',
            fontFamily: 'ui-monospace, monospace',
            fontSize: FONT_SIZES[i],
            fontWeight: WEIGHTS[i],
            // Multiply per-item opacity by global alpha so all items fade together
            opacity: OPACITIES[i] * alpha,
            transition: trans,
            filter: BLURS[i] > 0 ? `blur(${BLURS[i]}px)` : undefined,
            color: offset === 0
              ? (dark ? '#f5f5f4' : '#1c1917')
              : (dark ? '#a8a29e' : '#78716c'),
            userSelect: 'none',
            zIndex: 42,
            pointerEvents: 'none',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {/* Integer part: right-aligned up to cx */}
            <div style={{ width: cx, flexShrink: 0, textAlign: 'right' }}>{intPart}</div>
            {/* Decimal part: left-aligned from cx */}
            <div style={{ flex: 1, textAlign: 'left' }}>{decPart}</div>
          </div>
        )
      })}
    </>,
    document.body
  )
}
