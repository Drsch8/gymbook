export type DragInfo = { rect: DOMRect; value: number; step: number; rawSteps: number } | null

let _state: DragInfo = null
const _listeners = new Set<() => void>()
let _rafId: number | null = null

export const dragState = {
  get(): DragInfo { return _state },
  set(s: DragInfo) {
    _state = s
    if (s === null) {
      // Dismiss immediately so GhostPicker clears without waiting for next frame
      if (_rafId !== null) { cancelAnimationFrame(_rafId); _rafId = null }
      _listeners.forEach(l => l())
    } else {
      // Throttle continuous updates to one render per animation frame
      if (_rafId === null) {
        _rafId = requestAnimationFrame(() => {
          _rafId = null
          _listeners.forEach(l => l())
        })
      }
    }
  },
  subscribe(l: () => void) { _listeners.add(l); return () => { _listeners.delete(l) } },
}
