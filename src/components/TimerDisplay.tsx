import { formatCountdown, formatElapsed } from '../lib/format'
import type { DaySchedule } from '../domain/types'

interface TimerDisplayProps {
  intervalIndex: number
  remainingMs: number
  elapsedSleepMs: number
  schedule: DaySchedule
  status: string
}

export function TimerDisplay({ intervalIndex, remainingMs, elapsedSleepMs, schedule, status }: TimerDisplayProps) {
  const duration = schedule[Math.min(intervalIndex, schedule.length - 1)]
  const label = status === 'complete' ? 'Time to check in' : status === 'check_in' ? 'Check-in recorded' : status === 'asleep' ? 'Time asleep' : status === 'idle' ? 'Ready when you are' : `${duration} minute interval`
  return (
    <section className="timer-display" aria-live="polite">
      <p className="eyebrow">{status === 'asleep' ? 'Sleep tracking' : `Interval ${intervalIndex + 1}`} <span>{status === 'asleep' ? ' / elapsed' : `/ ${duration} min`}</span></p>
      <div className={`countdown ${status === 'complete' || status === 'check_in' ? 'countdown-complete' : ''}`}>{status === 'asleep' ? formatElapsed(elapsedSleepMs) : formatCountdown(remainingMs)}</div>
      <p className="timer-label">{label}</p>
    </section>
  )
}