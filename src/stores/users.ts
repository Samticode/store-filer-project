import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  type CollectionReference,
  type Query,
  type Unsubscribe,
} from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import { USERS_COLLECTION, type AuthUser, type UserRole } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { buildUserNameById, mergeUsersForDisplay, normalizeUser } from '@/utils/userNames'

function sortUsers(users: AuthUser[]) {
  return [...users].sort((a, b) => a.name.localeCompare(b.name, 'nb'))
}

export const useUsersStore = defineStore('users', () => {
  const db = useFirestore()
  const authStore = useAuthStore()
  const { currentUser } = storeToRefs(authStore)
  const usersSource = ref<CollectionReference | Query | null>(null)
  const usersCollection = useCollection<AuthUser>(usersSource)
  const liveUserNames = ref<Record<string, string>>({})
  const userDocUnsubs = new Map<string, Unsubscribe>()
  let subscribedToFullCollection = false

  const users = computed(() =>
    sortUsers(((usersCollection.value ?? []) as AuthUser[]).map(normalizeUser)),
  )

  const usersForDisplay = computed(() =>
    mergeUsersForDisplay(users.value, currentUser.value),
  )

  const userNameById = computed(() => ({
    ...buildUserNameById(users.value, currentUser.value),
    ...liveUserNames.value,
  }))

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
    if (subscribedToFullCollection && usersSource.value !== null) return
    usersSource.value = collection(db, USERS_COLLECTION)
    subscribedToFullCollection = true
  }

  function subscribeEmployeeTaskUsers() {
    subscribeUsers()
  }

  function syncLiveUserNameWatchers(userIds: string[]) {
    const wanted = new Set(userIds.filter(Boolean))

    for (const [userId, unsub] of userDocUnsubs) {
      if (wanted.has(userId)) continue
      unsub()
      userDocUnsubs.delete(userId)
      const next = { ...liveUserNames.value }
      delete next[userId]
      liveUserNames.value = next
    }

    for (const userId of wanted) {
      if (userDocUnsubs.has(userId)) continue

      const unsub = onSnapshot(doc(db, USERS_COLLECTION, userId), (snapshot) => {
        if (!snapshot.exists()) return
        liveUserNames.value = {
          ...liveUserNames.value,
          [userId]: snapshot.data().name as string,
        }
      })
      userDocUnsubs.set(userId, unsub)
    }
  }

  function clearLiveUserNameWatchers() {
    for (const unsub of userDocUnsubs.values()) {
      unsub()
    }
    userDocUnsubs.clear()
    liveUserNames.value = {}
  }

  function unsubscribeUsersListener() {
    usersSource.value = null
    subscribedToFullCollection = false
  }

  function resetListeners() {
    clearLiveUserNameWatchers()
    unsubscribeUsersListener()
  }

  async function updateUser(userId: string, data: { name: string; role: UserRole }) {
    await updateDoc(doc(db, USERS_COLLECTION, userId), data)
  }

  return {
    users,
    usersForDisplay,
    userNameById,
    projectLeaders,
    employees,
    loading,
    error,
    subscribeUsers,
    subscribeEmployeeTaskUsers,
    syncLiveUserNameWatchers,
    clearLiveUserNameWatchers,
    unsubscribeUsersListener,
    resetListeners,
    updateUser,
  }
})
