import type { DaySchedule, ScheduleMap } from './types'

export const FERBER_SCHEDULE_MINUTES: Record<number, DaySchedule> = {
  1: [3, 5, 10], 2: [5, 10, 12], 3: [10, 12, 15], 4: [12, 15, 17],
  5: [15, 17, 20], 6: [17, 20, 25], 7: [20, 25, 30]
}

export function clampDayNumber(dayNumber: number): number {
  return Math.min(14, Math.max(1, Math.round(dayNumber)))
}

export function getScheduleForDay(dayNumber: number): readonly number[] {
  const day = clampDayNumber(dayNumber)
  return FERBER_SCHEDULE_MINUTES[day >= 7 ? 7 : day]
}

export function createDefaultScheduleMap(): ScheduleMap {
  return Object.fromEntries(
    Array.from({ length: 14 }, (_, index) => {
      const day = index + 1
      return [day, [...FERBER_SCHEDULE_MINUTES[day >= 7 ? 7 : day]] as DaySchedule]
    })
  ) as ScheduleMap
}

export function validateDaySchedule(values: readonly number[]): values is DaySchedule {
  return values.length === 3 && values.every((value) => Number.isFinite(value) && value >= 1 && value <= 180)
}

export function normalizeScheduleMap(input: unknown): ScheduleMap {
  const defaults = createDefaultScheduleMap()
  if (!input || typeof input !== 'object') return defaults
  const candidate = input as Record<string, unknown>
  for (let day = 1; day <= 14; day += 1) {
    const values = candidate[day]
    if (Array.isArray(values) && validateDaySchedule(values)) {
      defaults[day] = values.map((value) => Math.round(value)) as DaySchedule
    }
  }
  return defaults
}

export function getIntervalDurationMinutes(dayNumber: number, intervalIndex: number): number {
  const schedule = getScheduleForDay(dayNumber)
  return schedule[Math.min(Math.max(0, Math.floor(intervalIndex)), schedule.length - 1)]
}

export function getCustomIntervalDurationMinutes(schedule: ScheduleMap, dayNumber: number, intervalIndex: number): number {
  const values = schedule[clampDayNumber(dayNumber)] ?? getScheduleForDay(dayNumber)
  return values[Math.min(Math.max(0, Math.floor(intervalIndex)), values.length - 1)]
}

export function getIntervalDurationMs(dayNumber: number, intervalIndex: number): number {
  return getIntervalDurationMinutes(dayNumber, intervalIndex) * 60_000
}
