// Shared Web Audio "ding" cue for class timers.
//
// A single AudioContext is reused for the whole session. iOS keeps a context
// suspended (silent) until it is resumed inside a user gesture, so we unlock it
// on the first user interaction; timer dings — which fire from background
// intervals, not gestures — are then audible. Reusing one context also avoids
// the per-call create/close that previously left every ding suspended on iOS.

type AudioCtor = typeof AudioContext

function getCtor(): AudioCtor | null {
  if (typeof window === 'undefined') return null
  return window.AudioContext
    ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext
    ?? null
}

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  const Ctor = getCtor()
  if (!Ctor) return null
  try {
    if (!ctx) ctx = new Ctor()
    return ctx
  } catch {
    return null
  }
}

/** Resume the shared audio context. Call from a user gesture to unlock iOS audio. */
export function primeAudio(): void {
  const c = getCtx()
  if (c && c.state === 'suspended') c.resume().catch(() => {})
}

// Auto-unlock on the first user interaction anywhere in the app, so later timer
// dings are audible even though they fire outside a gesture.
if (typeof window !== 'undefined') {
  const unlock = () => primeAudio()
  const opts: AddEventListenerOptions = { passive: true }
  window.addEventListener('pointerdown', unlock, opts)
  window.addEventListener('touchstart', unlock, opts)
  window.addEventListener('keydown', unlock)
}

/** Play a short 880 Hz ding once, or three times (e.g. a transition vs. the end). */
export function playDing(count: 1 | 3 = 1): void {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume().catch(() => {})
  const start = c.currentTime
  const offsets = count === 1 ? [0] : [0, 0.22, 0.44]
  for (const offset of offsets) {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0, start + offset)
    gain.gain.linearRampToValueAtTime(0.6, start + offset + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, start + offset + 0.4)
    osc.start(start + offset)
    osc.stop(start + offset + 0.4)
  }
}
