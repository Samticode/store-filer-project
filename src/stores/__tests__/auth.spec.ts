import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import '@/test/mocks/firebase'
import {
  mockSignIn,
  mockSignUp,
  mockSignOut,
  mockGetDoc,
  mockSetDoc,
  mockRouterReplace,
  authStateCallback,
  mockFirebaseUser,
  mockAuthUser,
  mockPendingAuthUser,
  mockGetDocSuccess,
  mockGetDocMissing,
} from '@/test/mocks/firebase'
import { useAuthStore } from '@/stores/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockSignIn.mockResolvedValue({ user: mockFirebaseUser })
    mockSignUp.mockResolvedValue({ user: mockFirebaseUser })
    mockSignOut.mockResolvedValue(undefined)
    mockSetDoc.mockResolvedValue(undefined)
    mockGetDocSuccess()
  })

  it('login loads profile and sets authenticated state', async () => {
    const store = useAuthStore()
    await authStateCallback(null)

    await store.login('test@example.com', 'password123')

    expect(mockSignIn).toHaveBeenCalledWith({}, 'test@example.com', 'password123')
    expect(mockGetDoc).toHaveBeenCalled()
    expect(store.currentUser).toEqual(mockAuthUser)
    expect(store.isAuthenticated).toBe(true)
    expect(store.hasRole).toBe(true)
    expect(store.homeRouteName).toBe('employee')
  })

  it('login throws when user profile is missing', async () => {
    mockGetDocMissing()
    const store = useAuthStore()
    await authStateCallback(null)

    await expect(store.login('test@example.com', 'wrong')).rejects.toThrow(
      'Ingen brukerprofil funnet for denne kontoen.',
    )
  })

  it('signup creates profile without role and routes to pending approval', async () => {
    const store = useAuthStore()
    await authStateCallback(null)

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
    mockGetDocSuccess(mockPendingAuthUser)
    const store = useAuthStore()
    await authStateCallback(null)

    await store.login('pending@example.com', 'password123')

    expect(store.homeRouteName).toBe('pending-approval')
    expect(store.isPendingApproval).toBe(true)
  })

  it('logout signs out, clears user, and redirects to login', async () => {
    const store = useAuthStore()
    await store.login('test@example.com', 'password123')

    await store.logout()

    expect(mockSignOut).toHaveBeenCalled()
    expect(store.currentUser).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(mockRouterReplace).toHaveBeenCalledWith({ name: 'login' })
  })
})
