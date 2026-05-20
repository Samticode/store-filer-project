import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { collection, doc, updateDoc, query, where, type CollectionReference, type Query } from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import { USERS_COLLECTION, type AuthUser, type UserRole } from '@/types'

function sortUsers(users: AuthUser[]) {
  return [...users].sort((a, b) => a.name.localeCompare(b.name, 'nb'))
}

export const useUsersStore = defineStore('users', () => {
  const db = useFirestore()
  const usersSource = ref<CollectionReference | Query | null>(null)
  const usersCollection = useCollection<AuthUser>(usersSource)

  const users = computed(() => sortUsers((usersCollection.value ?? []) as AuthUser[]))

  const loading = computed(() => usersSource.value !== null && usersCollection.pending.value)

  const error = computed(() => {
    if (!usersCollection.error.value) return null
    console.error('Kunne ikke lytte på brukere:', usersCollection.error.value)
    return 'Kunne ikke laste brukere. Prøv igjen senere.'
  })

  const projectLeaders = computed(() =>
    users.value
      .filter((user) => user.role === 'projectLeader')
      .sort((a, b) => a.name.localeCompare(b.name, 'nb')),
  )

  const employees = computed(() =>
    users.value
      .filter((user) => user.role === 'employee')
      .sort((a, b) => a.name.localeCompare(b.name, 'nb')),
  )

  function subscribeUsers() {
    usersSource.value = collection(db, USERS_COLLECTION)
  }

  function subscribeEmployeeTaskUsers() {
    usersSource.value = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'projectLeader'),
    )
  }

  function unsubscribeUsersListener() {
    usersSource.value = null
  }

  async function updateUser(userId: string, data: { name: string; role: UserRole }) {
    await updateDoc(doc(db, USERS_COLLECTION, userId), data)
  }

  return {
    users,
    projectLeaders,
    employees,
    loading,
    error,
    subscribeUsers,
    subscribeEmployeeTaskUsers,
    unsubscribeUsersListener,
    updateUser,
  }
})
