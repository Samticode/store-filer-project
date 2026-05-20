import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getFirestore,
  collection,
  doc,
  updateDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { firebaseApp } from '@/firebase'
import { USERS_COLLECTION, type AuthUser, type UserRole } from '@/types'

const db = getFirestore(firebaseApp)

function usersFromSnapshot(docs: { id: string; data: () => Record<string, unknown> }[]): AuthUser[] {
  const loaded = docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as AuthUser,
  )
  loaded.sort((a, b) => a.name.localeCompare(b.name, 'nb'))
  return loaded
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<AuthUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let unsubscribeUsers: Unsubscribe | null = null

  const projectLeaders = computed(() =>
    users.value
      .filter((user) => user.role === 'projectLeader')
      .sort((a, b) => a.name.localeCompare(b.name, 'nb')),
  )

  function subscribeUsers() {
    if (unsubscribeUsers) return

    loading.value = true
    error.value = null

    unsubscribeUsers = onSnapshot(
      collection(db, USERS_COLLECTION),
      (snapshot) => {
        users.value = usersFromSnapshot(snapshot.docs)
        loading.value = false
        error.value = null
      },
      (e) => {
        console.error('Kunne ikke lytte på brukere:', e)
        error.value = 'Kunne ikke laste brukere. Prøv igjen senere.'
        users.value = []
        loading.value = false
      },
    )
  }

  function unsubscribeUsersListener() {
    unsubscribeUsers?.()
    unsubscribeUsers = null
  }

  async function updateUser(userId: string, data: { name: string; role: UserRole }) {
    await updateDoc(doc(db, USERS_COLLECTION, userId), data)
  }

  return {
    users,
    projectLeaders,
    loading,
    error,
    subscribeUsers,
    unsubscribeUsersListener,
    updateUser,
  }
})
