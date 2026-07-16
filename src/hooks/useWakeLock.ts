import { useEffect } from 'react'

// Minimal shape of the Screen Wake Lock API, declared locally so the hook
// compiles regardless of the installed DOM lib version and degrades gracefully
// where the API is unavailable (e.g. older browsers).
interface WakeLockSentinel {
  release: () => Promise<void>
  addEventListener: (type: 'release', listener: () => void) => void
}
interface WakeLock {
  request: (type: 'screen') => Promise<WakeLockSentinel>
}

/**
 * Keeps the screen awake while `active` is true (e.g. during an active class).
 * The browser auto-releases the lock whenever the page is hidden, so it is
 * re-acquired on `visibilitychange`. No-ops where the API is unsupported.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const wakeLock = (navigator as unknown as { wakeLock?: WakeLock }).wakeLock
    if (!wakeLock) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const next = await wakeLock.request('screen')
        if (cancelled) {
          next.release().catch(() => {})
          return
        }
        // Auto-released when the page hides — clear so we re-acquire on return.
        next.addEventListener('release', () => { sentinel = null })
        sentinel = next
      } catch {
        // Request can reject (low battery, denied, etc.) — safe to ignore.
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !sentinel) acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      sentinel?.release().catch(() => {})
      sentinel = null
    }
  }, [active])
}
