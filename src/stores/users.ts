import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { firebaseApp } from '@/firebase'
import { USERS_COLLECTION, type AuthUser, type UserRole } from '@/types'

const db = getFirestore(firebaseApp)

export const useUsersStore = defineStore('users', () => {
  const users = ref<AuthUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const snapshot = await getDocs(collection(db, USERS_COLLECTION))
      const loaded = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as AuthUser,
      )
      loaded.sort((a, b) => a.name.localeCompare(b.name, 'nb'))
      users.value = loaded
    } catch (e) {
      console.error('Kunne ikke laste brukere:', e)
      error.value = 'Kunne ikke laste brukere. Prøv igjen senere.'
      users.value = []
    } finally {
      loading.value = false
    }
  }

  async function updateUser(userId: string, data: { name: string; role: UserRole }) {
    await updateDoc(doc(db, USERS_COLLECTION, userId), data)
    const user = users.value.find((u) => u.id === userId)
    if (user) {
      user.name = data.name
      user.role = data.role
      users.value.sort((a, b) => a.name.localeCompare(b.name, 'nb'))
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUser,
  }
})
