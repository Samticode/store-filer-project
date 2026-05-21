import type { Timestamp } from 'firebase/firestore'

export function formatNorwegianDate(timestamp: Timestamp) {
  return new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(timestamp.toDate())
}

export function formatNorwegianDateTime(timestamp: Timestamp) {
  return new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp.toDate())
}

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

export function formatRelativeTimeNorwegian(timestamp: Timestamp, now = new Date()) {
  const diffMs = Math.max(0, now.getTime() - timestamp.toDate().getTime())

  if (diffMs < MINUTE_MS) {
    return '1 minutt siden'
  }

  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS)
    return minutes === 1 ? '1 minutt siden' : `${minutes} minutter siden`
  }

  if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS)
    return hours === 1 ? '1 time siden' : `${hours} timer siden`
  }

  const days = Math.floor(diffMs / DAY_MS)
  return days === 1 ? '1 dag siden' : `${days} dager siden`
}
