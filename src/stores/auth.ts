import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { firebaseApp } from '@/firebase'
import { USERS_COLLECTION, type AuthUser } from '@/types'
import { routeNameForRole } from '@/utils/roleRoutes'

const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

async function loadUserProfile(uid: string): Promise<AuthUser> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
  if (!snap.exists()) {
    throw new Error('Ingen brukerprofil funnet for denne kontoen.')
  }
  return { id: uid, ...snap.data() } as AuthUser
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<AuthUser | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => currentUser.value !== null)

  const homeRouteName = computed(() =>
    currentUser.value ? routeNameForRole(currentUser.value.role) : null,
  )

  onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    try {
      if (firebaseUser) {
        currentUser.value = await loadUserProfile(firebaseUser.uid)
      } else {
        currentUser.value = null
      }
    } catch (error) {
      console.error('Klarte ikke å laste brukerprofil:', error)
      currentUser.value = null
      if (firebaseUser) {
        await signOut(auth)
      }
    } finally {
      loading.value = false
    }
  })

  async function login(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    currentUser.value = await loadUserProfile(user.uid)
  }

  async function logout() {
    await signOut(auth)
    currentUser.value = null
    const { default: router } = await import('@/router')
    await router.replace({ name: 'login' })
  }

  return {
    currentUser,
    loading,
    isAuthenticated,
    homeRouteName,
    login,
    logout,
  }
})
