import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowRef } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import '@/test/mocks/vuefire'
import '@/test/mocks/firebase'
import {
  mockSignIn,
  mockSignUp,
  mockSignOut,
  mockSetDoc,
  mockRouterReplace,
  mockFirebaseUser,
  mockAuthUser,
  mockPendingAuthUser,
} from '@/test/mocks/firebase'
import {
  resetVuefireMocks,
  mockAuthState,
  mockProfileValue,
  mockProfilePending,
  mockProfileDoc,
} from '@/test/mocks/vuefire'
import { useAuthStore } from '@/stores/auth'
import type { AuthUser } from '@/types'

function setProfile(user: AuthUser) {
  mockProfileValue.value = {
    email: user.email,
    name: user.name,
    ...(user.role != null ? { role: user.role } : {}),
  }
  mockProfilePending.value = false
  mockProfileDoc.promise = shallowRef(Promise.resolve(mockProfileValue.value)) as typeof mockProfileDoc.promise
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    resetVuefireMocks()
    mockSignIn.mockResolvedValue({ user: mockFirebaseUser })
    mockSignUp.mockResolvedValue({ user: mockFirebaseUser })
    mockSignOut.mockResolvedValue(undefined)
    mockSetDoc.mockResolvedValue(undefined)
  })

  it('login loads profile and sets authenticated state', async () => {
    await mockAuthState(null)
    setProfile(mockAuthUser)
    const store = useAuthStore()

    mockSignIn.mockImplementation(async () => {
      await mockAuthState(mockFirebaseUser)
      return { user: mockFirebaseUser }
    })

    await store.login('test@example.com', 'password123')

    expect(mockSignIn).toHaveBeenCalledWith({}, 'test@example.com', 'password123')
    expect(store.currentUser).toEqual(mockAuthUser)
    expect(store.isAuthenticated).toBe(true)
    expect(store.hasRole).toBe(true)
    expect(store.homeRouteName).toBe('employee')
  })

  it('login throws when user profile is missing', async () => {
    await mockAuthState(null)
    const store = useAuthStore()

    mockSignIn.mockImplementation(async () => {
      await mockAuthState(mockFirebaseUser)
      mockProfileValue.value = null
      mockProfileDoc.promise = shallowRef(Promise.resolve(null)) as typeof mockProfileDoc.promise
      return { user: mockFirebaseUser }
    })

    await expect(store.login('test@example.com', 'wrong')).rejects.toThrow(
      'Ingen brukerprofil funnet for denne kontoen.',
    )
  })

  it('signup creates profile without role and routes to pending approval', async () => {
    await mockAuthState(null)
    const store = useAuthStore()

    mockSignUp.mockImplementation(async () => {
      await mockAuthState(mockFirebaseUser)
      setProfile({
        id: mockFirebaseUser.uid,
        email: 'ny@example.com',
        name: 'Ny Bruker',
      })
      return { user: mockFirebaseUser }
    })

    await store.signup('Ny Bruker', 'ny@example.com', 'password123')

    expect(mockSignUp).toHaveBeenCalledWith({}, 'ny@example.com', 'password123')
    expect(mockSetDoc).toHaveBeenCalled()
    expect(store.currentUser).toEqual({
      id: 'test-uid-1',
      email: 'ny@example.com',
      name: 'Ny Bruker',
    })
    expect(store.hasRole).toBe(false)
    expect(store.isPendingApproval).toBe(true)
    expect(store.homeRouteName).toBe('pending-approval')
  })

  it('pending user has pending approval home route', async () => {
    setProfile(mockPendingAuthUser)
    const store = useAuthStore()

    mockSignIn.mockImplementation(async () => {
      await mockAuthState(mockFirebaseUser)
      setProfile(mockPendingAuthUser)
      return { user: mockFirebaseUser }
    })

    await store.login('pending@example.com', 'password123')

    expect(store.homeRouteName).toBe('pending-approval')
    expect(store.isPendingApproval).toBe(true)
  })

  it('logout signs out, clears user, and redirects to login', async () => {
    await mockAuthState(mockFirebaseUser)
    setProfile(mockAuthUser)
    const store = useAuthStore()

    mockSignOut.mockImplementation(async () => {
      await mockAuthState(null)
    })

    await store.logout()

    expect(mockSignOut).toHaveBeenCalled()
    expect(store.currentUser).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(mockRouterReplace).toHaveBeenCalledWith({ name: 'login' })
  })
})
