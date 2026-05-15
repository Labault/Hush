import { useState, useRef, useCallback, useEffect } from 'react'
import { createSession } from '../api/sessions'

type SessionPhase = 'waiting' | 'hidden' | 'completed' | 'tooShort' | 'submitted' | 'failed'

type SessionState = {
  phase: SessionPhase
  startedAt: Date | null
  endedAt: Date | null
  durationMs: number
  error: string | null
}

const initialState: SessionState = {
  phase: 'waiting',
  startedAt: null,
  endedAt: null,
  durationMs: 0,
  error: null,
}

export function useSilenceSession(playerId: string) {
  const [state, setState] = useState<SessionState>(initialState)

  const phaseRef = useRef<SessionPhase>('waiting')
  const startedAtRef = useRef<Date | null>(null)
  const endedAtRef = useRef<Date | null>(null)

  useEffect(() => {
    phaseRef.current = state.phase
  }, [state.phase])

  const handleVisibilityChange = useCallback(() => {
    const phase = phaseRef.current

    if (document.hidden && phase === 'waiting') {
      startedAtRef.current = new Date()
      setState(prev => ({ ...prev, phase: 'hidden' }))
      return
    }

    if (!document.hidden && phase === 'hidden') {
      const endedAt = new Date()
      endedAtRef.current = endedAt
      const startedAt = startedAtRef.current!
      const durationMs = endedAt.getTime() - startedAt.getTime()
      setState({
        phase: durationMs < 10000 ? 'tooShort' : 'completed',
        startedAt,
        endedAt,
        durationMs,
        error: null,
      })
    }
  }, [])

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [handleVisibilityChange])

  const start = useCallback(() => {
    startedAtRef.current = null
    endedAtRef.current = null
    setState(initialState)
  }, [])

  const reset = useCallback(() => {
    startedAtRef.current = null
    endedAtRef.current = null
    setState(initialState)
  }, [])

  const submit = useCallback(async () => {
    if (phaseRef.current !== 'completed') return
    const startedAt = startedAtRef.current
    const endedAt = endedAtRef.current
    if (!startedAt || !endedAt) return

    try {
      await createSession({
        playerId,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
      })
      setState(prev => ({ ...prev, phase: 'submitted' }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        phase: 'failed',
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      }))
    }
  }, [playerId])

  return { state, start, reset, submit }
}
