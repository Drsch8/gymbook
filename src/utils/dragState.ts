export type DragInfo = { rect: DOMRect; value: number; step: number } | null

let _state: DragInfo = null
const _listeners = new Set<() => void>()

export const dragState = {
  get(): DragInfo { return _state },
  set(s: DragInfo) { _state = s; _listeners.forEach(l => l()) },
  subscribe(l: () => void) { _listeners.add(l); return () => { _listeners.delete(l) } },
}
