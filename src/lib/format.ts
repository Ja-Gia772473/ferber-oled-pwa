export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000)
  return `${Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`
}

export function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(timestamp)
}

export function formatElapsed(milliseconds: number): string {
  const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000)
  return `${Math.floor(totalSeconds / 3600).toString().padStart(2, '0')}:${Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`
}