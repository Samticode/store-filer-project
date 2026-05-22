import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateEmail,
} from 'firebase/auth'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
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

function profileUpdateErrorMessage(error: unknown) {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: string }).code)
      : ''

  if (code === 'auth/requires-recent-login') {
    return 'Av sikkerhetsgrunner må du logge ut og inn igjen før du kan endre email.'
  }
  if (code === 'auth/email-already-in-use') {
    return 'Emailen er allerede i bruk.'
  }
  if (code === 'auth/invalid-email') {
    return 'Ugyldig email.'
  }

  return 'Kunne ikke oppdatere profil. Prøv igjen.'
}

export const useAuthStore = defineStore('auth', () => {
  const db = useFirestore()
  const auth = useFirebaseAuth()!
  const firebaseUser = useCurrentUser()
  const isAuthLoaded = useIsCurrentUserLoaded()
  const updatingProfile = ref(false)
  const profileUpdateError = ref<string | null>(null)

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
    const { useUsersStore } = await import('@/stores/users')
    useUsersStore().resetListeners()
    await signOut(auth)
    const { default: router } = await import('@/router')
    await router.replace({ name: 'login' })
  }

  async function updateProfile(data: { name: string; email: string }) {
    const user = firebaseUser.value
    if (!user) {
      throw new Error('Du er ikke innlogget.')
    }

    const trimmedName = data.name.trim()
    const trimmedEmail = data.email.trim()

    if (!trimmedName) {
      profileUpdateError.value = 'Navn kan ikke være tomt.'
      throw new Error(profileUpdateError.value)
    }

    if (!trimmedEmail) {
      profileUpdateError.value = 'Email kan ikke være tom.'
      throw new Error(profileUpdateError.value)
    }

    updatingProfile.value = true
    profileUpdateError.value = null

    try {
      if (trimmedEmail !== user.email) {
        await updateEmail(user, trimmedEmail)
      }

      await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
        name: trimmedName,
        email: trimmedEmail,
      })
    } catch (e) {
      console.error('Kunne ikke oppdatere profil:', e)
      profileUpdateError.value = profileUpdateErrorMessage(e)
      throw e
    } finally {
      updatingProfile.value = false
    }
  }

  return {
    currentUser,
    loading,
    isAuthenticated,
    hasRole,
    isPendingApproval,
    homeRouteName,
    updatingProfile,
    profileUpdateError,
    login,
    signup,
    logout,
    updateProfile,
  }
})
