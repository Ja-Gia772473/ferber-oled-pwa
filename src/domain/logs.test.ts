import { describe, expect, it } from 'vitest'
import { canDeleteSession } from './logs'

describe('session logs', () => {
  it('allows deleting historical sessions but protects the active session', () => {
    expect(canDeleteSession(12, null)).toBe(true)
    expect(canDeleteSession(12, 8)).toBe(true)
    expect(canDeleteSession(12, 12)).toBe(false)
  })
})