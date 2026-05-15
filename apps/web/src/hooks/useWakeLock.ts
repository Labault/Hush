import { useState, useRef, useEffect, useCallback } from 'react'

type WakeLockState = 'idle' | 'active' | 'unsupported' | 'error'

export function useWakeLock() {
  const [state, setState] = useState<WakeLockState>('idle')
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  const release = useCallback(async () => {
    if (sentinelRef.current) {
      await sentinelRef.current.release()
      sentinelRef.current = null
      setState('idle')
    }
  }, [])

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      setState('unsupported')
      return null
    }
    try {
      const sentinel = await navigator.wakeLock.request('screen')
      sentinelRef.current = sentinel
      setState('active')
      console.log('[WakeLock] active')
      return sentinel
    } catch {
      setState('error')
      return null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(() => {})
        sentinelRef.current = null
      }
    }
  }, [])

  return { state, request, release }
}
