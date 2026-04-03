import { useCallback, useEffect, useRef, useState } from 'react'

export function useRestTimer(defaultSeconds: number) {
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => () => clear(), [])

  const start = useCallback((seconds = defaultSeconds) => {
    clear()
    setRemaining(seconds)
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clear()
          setRunning(false)
          // Vibrate on finish if supported
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [defaultSeconds])

  const stop = useCallback(() => {
    clear()
    setRunning(false)
    setRemaining(0)
  }, [])

  return { remaining, running, start, stop }
}
