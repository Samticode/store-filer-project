import { computed, ref, shallowRef, type Ref } from 'vue'
import { vi } from 'vitest'

export const mockFirebaseUser = ref<{ uid: string } | null | undefined>(undefined)
export const mockAuthLoaded = ref(false)
export const mockProfileValue = ref<Record<string, unknown> | null | undefined>(undefined)
export const mockProfilePending = ref(false)

export const mockProfileDoc = Object.assign(mockProfileValue, {
  pending: mockProfilePending,
  error: ref(undefined),
  promise: shallowRef(Promise.resolve(undefined)) as ReturnType<typeof shallowRef<Promise<unknown>>>,
})

export const mockProjectsSource = ref<unknown>(null)
export const mockProjectsValue = ref<unknown[]>([])
export const mockProjectsPending = ref(false)
export const mockProjectsError = ref(undefined)

export const mockProjectsCollection = Object.assign(mockProjectsValue, {
  pending: mockProjectsPending,
  error: mockProjectsError,
  promise: shallowRef(Promise.resolve([])),
})

export const mockCurrentProjectId = ref<string | null>(null)
export const mockCurrentProjectValue = ref<Record<string, unknown> | null | undefined>(undefined)
export const mockCurrentProjectPending = ref(false)
export const mockCurrentProjectError = ref(undefined)

export const mockCurrentProjectDoc = Object.assign(mockCurrentProjectValue, {
  pending: mockCurrentProjectPending,
  error: mockCurrentProjectError,
  promise: shallowRef(Promise.resolve(undefined)),
})

export const mockUsersSource = ref<unknown>(null)
export const mockUsersValue = ref<unknown[]>([])
export const mockUsersPending = ref(false)
export const mockUsersError = ref(undefined)

export const mockUsersCollection = Object.assign(mockUsersValue, {
  pending: mockUsersPending,
  error: mockUsersError,
  promise: shallowRef(Promise.resolve([])),
})

function createCollectionMock(
  valueRef: Ref<unknown[]>,
  pendingRef: Ref<boolean>,
  errorRef: Ref<unknown>,
) {
  return Object.assign(valueRef, {
    pending: pendingRef,
    error: errorRef,
    promise: shallowRef(Promise.resolve([])),
  })
}

vi.mock('vuefire', () => ({
  useFirebaseApp: vi.fn(() => ({ options: { projectId: 'test-project' } })),
  useFirebaseAuth: vi.fn(() => ({})),
  useFirestore: vi.fn(() => ({})),
  useCurrentUser: vi.fn(() => mockFirebaseUser),
  useIsCurrentUserLoaded: vi.fn(() => computed(() => mockAuthLoaded.value)),
  useDocument: vi.fn(() => mockProfileDoc),
  useCollection: vi.fn((sourceRef: Ref<unknown>) => {
    if (sourceRef === mockProjectsSource) {
      return createCollectionMock(mockProjectsValue, mockProjectsPending, mockProjectsError)
    }
    if (sourceRef === mockUsersSource) {
      return createCollectionMock(mockUsersValue, mockUsersPending, mockUsersError)
    }
    return createCollectionMock(ref([]), ref(false), ref(undefined))
  }),
}))

export function resetVuefireMocks() {
  mockFirebaseUser.value = undefined
  mockAuthLoaded.value = false
  mockProfileValue.value = undefined
  mockProfilePending.value = false
  mockProjectsSource.value = null
  mockProjectsValue.value = []
  mockProjectsPending.value = false
  mockProjectsError.value = undefined
  mockCurrentProjectId.value = null
  mockCurrentProjectValue.value = undefined
  mockCurrentProjectPending.value = false
  mockCurrentProjectError.value = undefined
  mockUsersSource.value = null
  mockUsersValue.value = []
  mockUsersPending.value = false
  mockUsersError.value = undefined
}

export async function mockAuthState(user: { uid: string } | null) {
  mockFirebaseUser.value = user
  mockAuthLoaded.value = true
  if (!user) {
    mockProfileValue.value = undefined
    mockProfilePending.value = false
    return
  }

  mockProfilePending.value = false
  mockProfileDoc.promise = shallowRef(Promise.resolve(mockProfileValue.value)) as typeof mockProfileDoc.promise
}
