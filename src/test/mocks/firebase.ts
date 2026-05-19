import { vi } from 'vitest'
import type { AuthUser } from '@/types'

export const mockSignIn = vi.fn()
export const mockSignOut = vi.fn()
export const mockGetDoc = vi.fn()
export const mockRouterReplace = vi.fn()

/** Latest callback passed to `onAuthStateChanged` (for simulating auth changes). */
export const authStateCallback = vi.fn()

export const mockFirebaseUser = { uid: 'test-uid-1' }

export const mockAuthUser: AuthUser = {
  id: 'test-uid-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'employee',
}

export function mockGetDocSuccess(user: AuthUser = mockAuthUser) {
  mockGetDoc.mockResolvedValue({
    exists: () => true,
    data: () => ({
      email: user.email,
      name: user.name,
      role: user.role,
    }),
  })
}

export function mockGetDocMissing() {
  mockGetDoc.mockResolvedValue({
    exists: () => false,
    data: () => undefined,
  })
}

vi.mock('@/firebase', () => ({
  firebaseApp: {},
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  onAuthStateChanged: vi.fn((_auth: unknown, callback: (user: unknown) => void) => {
    authStateCallback.mockImplementation(callback)
    return vi.fn()
  }),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn((_db: unknown, ...path: string[]) => ({ path: path.join('/') })),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
}))

vi.mock('@/router', () => ({
  default: {
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
}))
