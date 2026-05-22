import { describe, it, expect } from 'vitest'
import type { Timestamp } from 'firebase/firestore'
import {
  formatNorwegianDate,
  formatNorwegianDateTime,
  formatRelativeTimeNorwegian,
} from '@/utils/formatDate'

function makeTimestamp(date: Date): Timestamp {
  return { toDate: () => date, toMillis: () => date.getTime() } as unknown as Timestamp
}

describe('formatNorwegianDate', () => {
  it('formaterer dato på norsk bokmål', () => {
    const ts = makeTimestamp(new Date('2024-03-15'))
    const result = formatNorwegianDate(ts)

    expect(result).toContain('15')
    expect(result).toContain('2024')
    expect(result.toLowerCase()).toContain('mars')
  })

  it('inkluderer ikke klokkeslett', () => {
    const ts = makeTimestamp(new Date('2024-06-01'))
    const result = formatNorwegianDate(ts)

    expect(result).not.toMatch(/\d{2}:\d{2}/)
  })
})

describe('formatNorwegianDateTime', () => {
  it('formaterer dato og klokkeslett på norsk bokmål', () => {
    const date = new Date('2024-03-15T14:30:00')
    const ts = makeTimestamp(date)
    const result = formatNorwegianDateTime(ts)

    expect(result).toContain('15')
    expect(result).toContain('2024')
    expect(result.toLowerCase()).toContain('mars')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})

describe('formatRelativeTimeNorwegian', () => {
  it('returnerer "1 minutt siden" for diff under 1 minutt', () => {
    const now = new Date(1000 * 60 * 10)
    const ts = makeTimestamp(new Date(now.getTime() - 30_000))

    expect(formatRelativeTimeNorwegian(ts, now)).toBe('1 minutt siden')
  })

  it('returnerer "1 minutt siden" for nøyaktig 1 minutt', () => {
    const now = new Date(1000 * 60 * 10)
    const ts = makeTimestamp(new Date(now.getTime() - 60_000))

    expect(formatRelativeTimeNorwegian(ts, now)).toBe('1 minutt siden')
  })

  it('returnerer "X minutter siden" for flere minutter', () => {
    const now = new Date(1000 * 60 * 10)
    const ts = makeTimestamp(new Date(now.getTime() - 5 * 60_000))

    expect(formatRelativeTimeNorwegian(ts, now)).toBe('5 minutter siden')
  })

  it('returnerer "1 time siden" for nøyaktig 1 time', () => {
    const now = new Date(1000 * 60 * 60 * 5)
    const ts = makeTimestamp(new Date(now.getTime() - 60 * 60_000))

    expect(formatRelativeTimeNorwegian(ts, now)).toBe('1 time siden')
  })

  it('returnerer "X timer siden" for flere timer', () => {
    const now = new Date(1000 * 60 * 60 * 5)
    const ts = makeTimestamp(new Date(now.getTime() - 3 * 60 * 60_000))

    expect(formatRelativeTimeNorwegian(ts, now)).toBe('3 timer siden')
  })

  it('returnerer "1 dag siden" for nøyaktig 1 dag', () => {
    const now = new Date(1000 * 60 * 60 * 48)
    const ts = makeTimestamp(new Date(now.getTime() - 24 * 60 * 60_000))

    expect(formatRelativeTimeNorwegian(ts, now)).toBe('1 dag siden')
  })

  it('returnerer "X dager siden" for flere dager', () => {
    const now = new Date(1000 * 60 * 60 * 24 * 10)
    const ts = makeTimestamp(new Date(now.getTime() - 4 * 24 * 60 * 60_000))

    expect(formatRelativeTimeNorwegian(ts, now)).toBe('4 dager siden')
  })

  it('håndterer fremtidig tidsstempel (diff=0) som "1 minutt siden"', () => {
    const now = new Date(1000)
    const ts = makeTimestamp(new Date(now.getTime() + 5000))

    expect(formatRelativeTimeNorwegian(ts, now)).toBe('1 minutt siden')
  })
})
