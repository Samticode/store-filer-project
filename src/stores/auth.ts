import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { firebaseApp } from '@/firebase'
import { USERS_COLLECTION, hasUserRole, type AuthUser } from '@/types'
import { homeRouteNameForUser } from '@/utils/roleRoutes'

const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

function profileFromSnapshot(uid: string, data: Record<string, unknown>): AuthUser {
  return {
    id: uid,
    email: data.email as string,
    name: data.name as string,
    ...(data.role != null ? { role: data.role as AuthUser['role'] } : {}),
  }
}

async function loadUserProfile(uid: string): Promise<AuthUser> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
  if (!snap.exists()) {
    throw new Error('Ingen brukerprofil funnet for denne kontoen.')
  }
  return profileFromSnapshot(uid, snap.data())
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<AuthUser | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const hasRole = computed(() => hasUserRole(currentUser.value))
  const isPendingApproval = computed(() => isAuthenticated.value && !hasRole.value)

  const homeRouteName = computed(() => homeRouteNameForUser(currentUser.value))

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

  async function signup(name: string, email: string, password: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    const profile = { email, name }
    await setDoc(doc(db, USERS_COLLECTION, user.uid), profile)
    currentUser.value = { id: user.uid, ...profile }
  }

  async function logout() {
    await signOut(auth)
    currentUser.value = null
    const { default: router } = await import('@/router')
    await router.replace({ name: 'login' })
  }

  function watchProfile() {
    const uid = auth.currentUser?.uid
    if (!uid) return () => {}

    return onSnapshot(doc(db, USERS_COLLECTION, uid), (snap) => {
      if (snap.exists()) {
        currentUser.value = profileFromSnapshot(uid, snap.data())
      }
    })
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
    watchProfile,
  }
})
