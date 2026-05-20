import { computed, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import {
  useCurrentUser,
  useDocument,
  useFirestore,
  useFirebaseAuth,
  useIsCurrentUserLoaded,
} from 'vuefire'
import { USERS_COLLECTION, hasUserRole, type AuthUser } from '@/types'
import { homeRouteNameForUser } from '@/utils/roleRoutes'

function profileFromSnapshot(uid: string, data: Record<string, unknown>): AuthUser {
  return {
    id: uid,
    email: data.email as string,
    name: data.name as string,
    ...(data.role != null ? { role: data.role as AuthUser['role'] } : {}),
  }
}

export const useAuthStore = defineStore('auth', () => {
  const db = useFirestore()
  const auth = useFirebaseAuth()!
  const firebaseUser = useCurrentUser()
  const isAuthLoaded = useIsCurrentUserLoaded()

  const profileSource = computed(() => {
    const uid = firebaseUser.value?.uid
    return uid ? doc(db, USERS_COLLECTION, uid) : null
  })

  const profileDoc = useDocument(profileSource)

  watch(
    () =>
      [
        isAuthLoaded.value,
        firebaseUser.value?.uid ?? null,
        profileDoc.pending.value,
        profileDoc.value,
      ] as const,
    async ([loaded, uid, pending, profile]) => {
      if (!loaded || !uid || pending) return
      if (profile == null) {
        console.error('Klarte ikke å laste brukerprofil')
        await signOut(auth)
      }
    },
  )

  const currentUser = computed<AuthUser | null>(() => {
    const user = firebaseUser.value
    if (!user) return null

    const profile = profileDoc.value
    if (!profile || profileDoc.pending.value) return null

    return profileFromSnapshot(user.uid, profile as Record<string, unknown>)
  })

  const loading = computed(
    () => !isAuthLoaded.value || (firebaseUser.value != null && profileDoc.pending.value),
  )

  const isAuthenticated = computed(() => currentUser.value !== null)
  const hasRole = computed(() => hasUserRole(currentUser.value))
  const isPendingApproval = computed(() => isAuthenticated.value && !hasRole.value)
  const homeRouteName = computed(() => homeRouteNameForUser(currentUser.value))

  async function waitForProfile() {
    if (!firebaseUser.value) return
    await profileDoc.promise.value
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
    await waitForProfile()
    if (!profileDoc.value) {
      throw new Error('Ingen brukerprofil funnet for denne kontoen.')
    }
  }

  async function signup(name: string, email: string, password: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    const profile = { email, name }
    await setDoc(doc(db, USERS_COLLECTION, user.uid), profile)
    await waitForProfile()
  }

  async function logout() {
    await signOut(auth)
    const { default: router } = await import('@/router')
    await router.replace({ name: 'login' })
  }

  return {
    currentUser,
    loading,
    isAuthenticated,
    hasRole,
    isPendingApproval,
    homeRouteName,
    login,
    signup,
    logout,
  }
})
