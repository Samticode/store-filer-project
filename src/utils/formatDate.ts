import type { Timestamp } from 'firebase/firestore'

export function formatNorwegianDate(timestamp: Timestamp) {
  return new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(timestamp.toDate())
}
