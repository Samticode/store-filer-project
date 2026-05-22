import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, shallowRef } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useCollection } from 'vuefire'
import { mockUpdateDoc } from '@/test/mocks/firebase'
import { useUsersStore } from '@/stores/users'
import type { AuthUser } from '@/types'

function makeUser(overrides: Partial<AuthUser>): AuthUser {
  return { id: '1', name: 'Test', email: 'test@e.com', ...overrides }
}

function makeMockCollection(users: AuthUser[]) {
  const usersRef = ref(users)
  return Object.assign(usersRef, {
    pending: ref(false),
    error: ref(undefined),
    promise: shallowRef(Promise.resolve(users)),
  })
}

describe('useUsersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockUpdateDoc.mockResolvedValue(undefined)
    vi.mocked(useCollection).mockReturnValue(makeMockCollection([]) as ReturnType<typeof useCollection>)
  })

  describe('updateUser', () => {
    it('kaller updateDoc med riktig bruker-id og data', async () => {
      const store = useUsersStore()
      await store.updateUser('user-1', {
        name: 'Ny Navn',
        email: 'ny@example.com',
        role: 'projectLeader',
      })

      expect(mockUpdateDoc).toHaveBeenCalledOnce()
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('user-1') }),
        { name: 'Ny Navn', email: 'ny@example.com', role: 'projectLeader' },
      )
    })
  })

  describe('projectLeaders', () => {
    it('inneholder kun brukere med rolle projectLeader', () => {
      const users = [
        makeUser({ id: '1', name: 'Arne', role: 'projectLeader' }),
        makeUser({ id: '2', name: 'Bob', role: 'employee' }),
        makeUser({ id: '3', name: 'Carl', role: 'projectLeader' }),
      ]
      vi.mocked(useCollection).mockReturnValue(makeMockCollection(users) as ReturnType<typeof useCollection>)

      const store = useUsersStore()

      expect(store.projectLeaders).toHaveLength(2)
      expect(store.projectLeaders.every((u) => u.role === 'projectLeader')).toBe(true)
    })
  })

  describe('employees', () => {
    it('inneholder kun brukere med rolle employee', () => {
      const users = [
        makeUser({ id: '1', name: 'Arne', role: 'projectLeader' }),
        makeUser({ id: '2', name: 'Bob', role: 'employee' }),
        makeUser({ id: '3', name: 'Carl', role: 'employee' }),
      ]
      vi.mocked(useCollection).mockReturnValue(makeMockCollection(users) as ReturnType<typeof useCollection>)

      const store = useUsersStore()

      expect(store.employees).toHaveLength(2)
      expect(store.employees.every((u) => u.role === 'employee')).toBe(true)
    })
  })

  describe('users', () => {
    it('er sortert alfabetisk på norsk etter navn', () => {
      const users = [
        makeUser({ id: '1', name: 'Øyvind' }),
        makeUser({ id: '2', name: 'Arne' }),
        makeUser({ id: '3', name: 'Åse' }),
        makeUser({ id: '4', name: 'Bjørn' }),
      ]
      vi.mocked(useCollection).mockReturnValue(makeMockCollection(users) as ReturnType<typeof useCollection>)

      const store = useUsersStore()
      const names = store.users.map((u) => u.name)

      expect(names).toEqual(['Arne', 'Bjørn', 'Øyvind', 'Åse'])
    })
  })
})
