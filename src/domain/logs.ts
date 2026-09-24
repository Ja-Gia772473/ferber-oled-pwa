export function canDeleteSession(sessionId: number, activeSessionId: number | null): boolean {
  return sessionId !== activeSessionId
}