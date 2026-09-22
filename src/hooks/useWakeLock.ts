import { useCallback, useEffect, useRef } from 'react'

export function useWakeLock(active: boolean): void {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  const request = useCallback(async () => {
    if (!active || !('wakeLock' in navigator)) return
    try {
      lockRef.current = await navigator.wakeLock.request('screen')
    } catch {
      lockRef.current = null
    }
  }, [active])

  useEffect(() => {
    void request()
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void request()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void lockRef.current?.release()
      lockRef.current = null
    }
  }, [request])
}