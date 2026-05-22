import { describe, it, expect } from 'vitest'
import {
  normalizeUser,
  mergeUsersForDisplay,
  buildUserNameById,
  resolveUserName,
} from '@/utils/userNames'
import type { AuthUser } from '@/types'

function makeUser(overrides: Partial<AuthUser>): AuthUser {
  return { id: '1', name: 'Test', email: 'test@e.com', ...overrides }
}

describe('normalizeUser', () => {
  it('returnerer bruker med id, email og name', () => {
    const user = makeUser({ id: 'u1', name: 'Arne', email: 'arne@e.com' })
    const result = normalizeUser(user)

    expect(result).toEqual({ id: 'u1', name: 'Arne', email: 'arne@e.com' })
  })

  it('inkluderer role når den er satt', () => {
    const user = makeUser({ role: 'employee' })
    const result = normalizeUser(user)

    expect(result.role).toBe('employee')
  })

  it('utelater role når den er undefined', () => {
    const user = makeUser({})
    delete user.role
    const result = normalizeUser(user)

    expect('role' in result).toBe(false)
  })
})

describe('mergeUsersForDisplay', () => {
  it('returnerer normalisert liste uten currentUser', () => {
    const users = [makeUser({ id: '1', name: 'Arne' }), makeUser({ id: '2', name: 'Bob' })]
    const result = mergeUsersForDisplay(users, null)

    expect(result).toHaveLength(2)
    expect(result.map((u) => u.name)).toEqual(['Arne', 'Bob'])
  })

  it('setter currentUser foran listen når de ikke er i listen', () => {
    const users = [makeUser({ id: '2', name: 'Bob' })]
    const current = makeUser({ id: '99', name: 'Meg' })
    const result = mergeUsersForDisplay(users, current)

    expect(result[0].id).toBe('99')
    expect(result).toHaveLength(2)
  })

  it('erstatter bruker i listen med currentUser-data når id matcher', () => {
    const users = [
      makeUser({ id: '1', name: 'Gammelt navn' }),
      makeUser({ id: '2', name: 'Bob' }),
    ]
    const current = makeUser({ id: '1', name: 'Oppdatert navn' })
    const result = mergeUsersForDisplay(users, current)

    expect(result).toHaveLength(2)
    const found = result.find((u) => u.id === '1')
    expect(found?.name).toBe('Oppdatert navn')
  })
})

describe('buildUserNameById', () => {
  it('lager et id→navn-oppslag for alle brukere', () => {
    const users = [makeUser({ id: 'a', name: 'Arne' }), makeUser({ id: 'b', name: 'Bob' })]
    const result = buildUserNameById(users, null)

    expect(result).toEqual({ a: 'Arne', b: 'Bob' })
  })

  it('bruker oppdatert navn fra currentUser', () => {
    const users = [makeUser({ id: 'a', name: 'Gammelt' })]
    const current = makeUser({ id: 'a', name: 'Nytt' })
    const result = buildUserNameById(users, current)

    expect(result['a']).toBe('Nytt')
  })
})

describe('resolveUserName', () => {
  it('returnerer currentUser.name direkte ved id-match', () => {
    const users = [makeUser({ id: 'u1', name: 'Fra liste' })]
    const current = makeUser({ id: 'u1', name: 'Fra currentUser' })

    expect(resolveUserName('u1', users, current)).toBe('Fra currentUser')
  })

  it('slår opp navn fra brukerlisten', () => {
    const users = [makeUser({ id: 'u2', name: 'Bob' })]

    expect(resolveUserName('u2', users, null)).toBe('Bob')
  })

  it('returnerer "Ukjent" for ukjent bruker-id', () => {
    expect(resolveUserName('ukjent-id', [], null)).toBe('Ukjent')
  })
})
