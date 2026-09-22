export const EVENT_TYPES = ['put_down', 'interval_reset', 'check_in', 'interval_resumed', 'fell_asleep'] as const
export type EventType = (typeof EVENT_TYPES)[number]
export type SessionStatus = 'active' | 'completed'
export type TimerStatus = 'idle' | 'running' | 'complete' | 'check_in' | 'asleep' | 'ended'

export type DaySchedule = [number, number, number]
export type ScheduleMap = Record<number, DaySchedule>

export interface Session {
  id?: number
  startTime: number
  endTime?: number
  dayNumber: number
  schedule?: DaySchedule
  status: SessionStatus
  notes?: string
}

export interface SessionEvent {
  id?: number
  sessionId: number
  timestamp: number
  type: EventType
  intervalIndex: number
  targetDurationMs: number
  actualElapsedMs?: number
}

export interface TimerState {
  sessionId: number | null
  dayNumber: number
  intervalIndex: number
  targetEndTime: number | null
  durationMs: number
  remainingMs: number
  asleepAt: number | null
  elapsedSleepMs: number
  status: TimerStatus
  schedule: DaySchedule
}
