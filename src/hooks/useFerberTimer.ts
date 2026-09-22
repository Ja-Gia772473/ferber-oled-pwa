import { useCallback, useEffect, useRef, useState } from 'react'
import { appendEvent, closeSession, createSession } from '../db/database'
import type { DaySchedule, EventType, ScheduleMap, TimerState } from '../domain/types'
import { playIntervalCompleteFeedback } from '../lib/feedback'

const RECOVERY_KEY = 'ferber-active-timer'

function readRecovery(): Partial<TimerState> {
  try {
    return JSON.parse(localStorage.getItem(RECOVERY_KEY) ?? '{}') as Partial<TimerState>
  } catch {
    return {}
  }
}

function durationFor(schedule: DaySchedule, intervalIndex: number): number {
  return schedule[Math.min(Math.max(0, Math.floor(intervalIndex)), schedule.length - 1)] * 60_000
}

export function useFerberTimer(dayNumber: number, scheduleMap: ScheduleMap) {
  const recovery = readRecovery()
  const initialSchedule = recovery.schedule ?? scheduleMap[dayNumber] ?? [3, 5, 10]
  const [state, setState] = useState<TimerState>(() => ({
    sessionId: recovery.sessionId ?? null,
    dayNumber: recovery.dayNumber ?? dayNumber,
    intervalIndex: recovery.intervalIndex ?? 0,
    targetEndTime: recovery.targetEndTime ?? null,
    durationMs: recovery.durationMs ?? durationFor(initialSchedule, recovery.intervalIndex ?? 0),
    remainingMs: recovery.targetEndTime ? Math.max(0, recovery.targetEndTime - Date.now()) : 0,
    asleepAt: recovery.asleepAt ?? null,
    elapsedSleepMs: recovery.asleepAt ? Math.max(0, Date.now() - recovery.asleepAt) : 0,
    status: recovery.status ?? 'idle',
    schedule: initialSchedule
  }))
  const expiredTarget = useRef<number | null>(null)

  const reconcile = useCallback(() => {
    setState((current) => {
      if (current.status === 'asleep' && current.asleepAt) {
        return { ...current, elapsedSleepMs: Math.max(0, Date.now() - current.asleepAt) }
      }
      if (current.status !== 'running' || !current.targetEndTime) return current
      const remainingMs = Math.max(0, current.targetEndTime - Date.now())
      if (remainingMs > 0) return { ...current, remainingMs }
      if (expiredTarget.current !== current.targetEndTime) {
        expiredTarget.current = current.targetEndTime
        playIntervalCompleteFeedback()
      }
      return { ...current, remainingMs: 0, status: 'complete' }
    })
  }, [])

  useEffect(() => {
    const worker = new Worker(new URL('../workers/heartbeat.ts', import.meta.url), { type: 'module' })
    worker.onmessage = reconcile
    const onVisibilityChange = () => reconcile()
    document.addEventListener('visibilitychange', onVisibilityChange)
    reconcile()
    return () => {
      worker.terminate()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [reconcile])

  useEffect(() => {
    if (state.sessionId && ['running', 'complete', 'check_in', 'asleep'].includes(state.status)) {
      localStorage.setItem(RECOVERY_KEY, JSON.stringify(state))
    } else if (['idle', 'ended'].includes(state.status)) {
      localStorage.removeItem(RECOVERY_KEY)
    }
  }, [state])

  const logEvent = useCallback(async (type: EventType, current: TimerState) => {
    if (!current.sessionId) return
    await appendEvent({
      sessionId: current.sessionId,
      timestamp: Date.now(),
      type,
      intervalIndex: current.intervalIndex,
      targetDurationMs: current.durationMs,
      actualElapsedMs: Math.max(0, current.durationMs - current.remainingMs)
    })
  }, [])

  const start = useCallback(async () => {
    const sessionSchedule = scheduleMap[dayNumber] ?? [3, 5, 10]
    const sessionId = await createSession(dayNumber, sessionSchedule)
    const durationMs = durationFor(sessionSchedule, 0)
    const next: TimerState = { sessionId, dayNumber, intervalIndex: 0, durationMs, targetEndTime: Date.now() + durationMs, remainingMs: durationMs, asleepAt: null, elapsedSleepMs: 0, status: 'running', schedule: sessionSchedule }
    setState(next)
    await appendEvent({ sessionId, timestamp: Date.now(), type: 'put_down', intervalIndex: 0, targetDurationMs: durationMs })
  }, [dayNumber, scheduleMap])

  const resetInterval = useCallback(async () => {
    const current = state
    if (current.status !== 'running' && current.status !== 'complete') return
    await logEvent('interval_reset', current)
    const targetEndTime = Date.now() + current.durationMs
    expiredTarget.current = null
    setState({ ...current, targetEndTime, remainingMs: current.durationMs, status: 'running' })
  }, [logEvent, state])

  const checkIn = useCallback(async () => {
    if (state.status !== 'complete') return
    await logEvent('check_in', state)
    setState((current) => ({ ...current, status: 'check_in' }))
  }, [logEvent, state])

  const resumeInterval = useCallback(async () => {
    if (state.status !== 'check_in') return
    await logEvent('interval_resumed', state)
    const intervalIndex = state.intervalIndex + 1
    const durationMs = durationFor(state.schedule, intervalIndex)
    expiredTarget.current = null
    setState({ ...state, intervalIndex, durationMs, targetEndTime: Date.now() + durationMs, remainingMs: durationMs, status: 'running' })
  }, [logEvent, state])

  const fellAsleep = useCallback(async () => {
    const current = state
    if (!current.sessionId || ['idle', 'ended', 'asleep'].includes(current.status)) return
    await logEvent('fell_asleep', current)
    const asleepAt = Date.now()
    setState({ ...current, status: 'asleep', asleepAt, elapsedSleepMs: 0, targetEndTime: null, remainingMs: 0 })
  }, [logEvent, state])

  const end = useCallback(async () => {
    if (!state.sessionId) return
    await closeSession(state.sessionId, state.asleepAt ? `Sleep tracked for ${Math.round((Date.now() - state.asleepAt) / 60_000)} minutes.` : undefined)
    setState((current) => ({ ...current, status: 'ended', targetEndTime: null, remainingMs: 0 }))
  }, [state.asleepAt, state.sessionId])

  return { ...state, start, resetInterval, checkIn, resumeInterval, fellAsleep, end }
}
