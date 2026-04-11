import { useEffect, useReducer } from 'react'
import { createPortal } from 'react-dom'
import { dragState } from '../utils/dragState'

const OFFSETS    = [-2, -1,  0,  1,  2]
const GAP        = 46
const FONT_SIZES = [13, 21, 44, 21, 13]
const OPACITIES  = [0.16, 0.42, 1, 0.42, 0.16]
const BLURS      = [2.5, 1.2, 0, 1.2, 2.5]
const WEIGHTS    = [400, 400, 700, 400, 400]
const ITEM_H     = 46

function formatParts(v: number, decimalPlaces: number): { int: string; dec: string } {
  const fixed = v.toFixed(decimalPlaces)
  const dot   = fixed.indexOf('.')
  if (dot === -1) return { int: fixed, dec: '' }
  return { int: fixed.slice(0, dot), dec: fixed.slice(dot) }
}

export function GhostPicker() {
  const [, tick] = useReducer(n => n + 1, 0)
  useEffect(() => dragState.subscribe(tick), [])

  const s = dragState.get()
  if (!s) return null

  const { rect, value, step, rawSteps } = s
  const fraction      = rawSteps - Math.round(rawSteps)   // [-0.5, 0.5]
  const cx            = rect.left + rect.width / 2
  const cy            = rect.top  + rect.height / 2
  const dark          = document.documentElement.classList.contains('dark')
  const decimalPlaces = (step.toString().split('.')[1] ?? '').length

  const bandColor = dark ? '#57534e' : '#d6d3d1'

  return createPortal(
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 40, pointerEvents: 'none',
        background: dark ? 'rgba(28,25,23,0.55)' : 'rgba(250,250,249,0.72)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      }} />

      {/* Selection band */}
      <div style={{
        position: 'fixed', left: 0, right: 0, zIndex: 41, pointerEvents: 'none',
        top: cy - GAP / 2, height: GAP,
        borderTop:    `1px solid ${bandColor}`,
        borderBottom: `1px solid ${bandColor}`,
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
            opacity: OPACITIES[i],
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
