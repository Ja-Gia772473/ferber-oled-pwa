import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Clock3, Trash2, X } from 'lucide-react'
import { db, deleteSession, getSessionEvents } from '../db/database'
import { canDeleteSession } from '../domain/logs'
import type { Session, SessionEvent } from '../domain/types'
import { formatTimestamp } from '../lib/format'

interface SessionDrawerProps {
  open: boolean
  activeSessionId: number | null
  onClose: () => void
}

const eventLabels: Record<SessionEvent['type'], string> = {
  put_down: 'Put down', interval_reset: 'Crying resumed', check_in: 'Check-in', interval_resumed: 'Interval resumed', fell_asleep: 'Fell asleep'
}

export function SessionDrawer({ open, activeSessionId, onClose }: SessionDrawerProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [expanded, setExpanded] = useState<number | null>(activeSessionId)
  const [events, setEvents] = useState<Record<number, SessionEvent[]>>({})
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    void db.sessions.orderBy('startTime').reverse().toArray().then(setSessions)
  }, [open, activeSessionId])

  const toggleSession = async (session: Session & { id?: number }) => {
    if (!session.id) return
    if (expanded === session.id) { setExpanded(null); return }
    setExpanded(session.id)
    if (!events[session.id]) {
      const sessionEvents = await getSessionEvents(session.id)
      setEvents((current) => ({ ...current, [session.id!]: sessionEvents }))
    }
  }

  const handleDelete = async (session: Session & { id?: number }) => {
    if (!session.id || !canDeleteSession(session.id, activeSessionId)) return
    if (!window.confirm('Delete this session log and all of its events?')) return

    setDeletingId(session.id)
    try {
      await deleteSession(session.id)
      setSessions((current) => current.filter(({ id }) => id !== session.id))
      setEvents((current) => {
        const next = { ...current }
        delete next[session.id!]
        return next
      })
      setExpanded((current) => current === session.id ? null : current)
    } catch {
      window.alert('Unable to delete this session log.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!open) return null
  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="session-drawer" role="dialog" aria-modal="true" aria-label="Session logs" onClick={(event) => event.stopPropagation()}>
        <header className="drawer-header"><div><p className="eyebrow">Local journal</p><h2>Session logs</h2></div><button className="icon-button" aria-label="Close logs" onClick={onClose}><X size={22} /></button></header>
        <div className="session-list">
          {sessions.length === 0 && <p className="empty-state">No sessions yet.</p>}
          {sessions.map((session) => (
            <div className={`session-row ${session.id === activeSessionId ? 'session-row-active' : ''}`} key={session.id}>
              <div className="session-row-header">
                <button className="session-summary" onClick={() => void toggleSession(session)}>
                  <span><strong>Day {session.dayNumber}</strong><small><Clock3 size={13} /> {formatTimestamp(session.startTime)}</small></span>
                  {expanded === session.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <button
                  className="delete-log-button"
                  aria-label={`Delete Day ${session.dayNumber} log`}
                  title={canDeleteSession(session.id!, activeSessionId) ? 'Delete log' : 'End the active session before deleting its log'}
                  disabled={!canDeleteSession(session.id!, activeSessionId) || deletingId === session.id}
                  onClick={(event) => { event.stopPropagation(); void handleDelete(session) }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {expanded === session.id && <div className="event-list">{(events[session.id!] ?? []).map((event) => <div className="event-row" key={event.id}><span>{eventLabels[event.type]}</span><time>{formatTimestamp(event.timestamp)}</time></div>)}</div>}
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}