import Dexie, { type Table } from 'dexie'
import type { Session, SessionEvent } from '../domain/types'

export class FerberTrackerDB extends Dexie {
  sessions!: Table<Session, number>
  events!: Table<SessionEvent, number>

  constructor() {
    super('FerberTrackerDB')
    this.version(1).stores({
      sessions: '++id, startTime, endTime, dayNumber, status',
      events: '++id, sessionId, timestamp, type, intervalIndex'
    })
  }
}

export const db = new FerberTrackerDB()

export async function createSession(dayNumber: number, schedule: Session['schedule']): Promise<number> {
  return db.sessions.add({ startTime: Date.now(), dayNumber, schedule, status: 'active' })
}

export async function appendEvent(event: SessionEvent): Promise<number> {
  return db.events.add(event)
}

export async function closeSession(sessionId: number, notes?: string): Promise<void> {
  await db.sessions.update(sessionId, { endTime: Date.now(), status: 'completed', notes })
}

export async function getSessionEvents(sessionId: number): Promise<SessionEvent[]> {
  return db.events.where('sessionId').equals(sessionId).sortBy('timestamp')
}

export async function deleteSession(sessionId: number): Promise<void> {
  await db.transaction('rw', db.sessions, db.events, async () => {
    await db.events.where('sessionId').equals(sessionId).delete()
    await db.sessions.delete(sessionId)
  })
}