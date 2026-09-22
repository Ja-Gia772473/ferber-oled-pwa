import { describe, expect, it } from 'vitest'
import { clampDayNumber, createDefaultScheduleMap, getCustomIntervalDurationMinutes, getIntervalDurationMinutes, getScheduleForDay, normalizeScheduleMap, validateDaySchedule } from './schedule'

describe('Ferber schedule', () => {
  it('returns the correct schedules', () => {
    expect(getScheduleForDay(1)).toEqual([3, 5, 10])
    expect(getScheduleForDay(4)).toEqual([12, 15, 17])
    expect(getScheduleForDay(14)).toEqual([20, 25, 30])
  })
  it('repeats the final duration after the third interval', () => {
    expect(getIntervalDurationMinutes(1, 0)).toBe(3)
    expect(getIntervalDurationMinutes(1, 2)).toBe(10)
    expect(getIntervalDurationMinutes(1, 9)).toBe(10)
  })
  it('clamps manual day selection to Days 1 through 14', () => {
    expect(clampDayNumber(-2)).toBe(1)
    expect(clampDayNumber(8.6)).toBe(9)
    expect(clampDayNumber(20)).toBe(14)
  })

  it('supports validated per-day custom intervals and repeats the last value', () => {
    const custom = createDefaultScheduleMap()
    custom[3] = [2, 4, 8]
    expect(getCustomIntervalDurationMinutes(custom, 3, 0)).toBe(2)
    expect(getCustomIntervalDurationMinutes(custom, 3, 8)).toBe(8)
    expect(validateDaySchedule([1, 2, 3])).toBe(true)
    expect(validateDaySchedule([0, 2, 3])).toBe(false)
  })

  it('normalizes invalid custom days back to defaults', () => {
    const schedule = normalizeScheduleMap({ 2: [4, 6, 9], 4: [0, 1, 2] })
    expect(schedule[2]).toEqual([4, 6, 9])
    expect(schedule[4]).toEqual([12, 15, 17])
  })
})
