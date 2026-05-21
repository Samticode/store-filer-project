import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { collection, query, where, type Query } from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import { TASKS_COLLECTION, TASK_STATUS_PENDING_APPROVAL, type Task } from '@/types'

const FIRESTORE_IN_QUERY_LIMIT = 10

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
}

export const usePendingApprovalTasksStore = defineStore('pendingApprovalTasks', () => {
  const db = useFirestore()
  const tasksSource = ref<Query | null>(null)
  const tasksCollection = useCollection<Task>(tasksSource)

  const tasks = computed(() =>
    sortTasks((tasksCollection.value ?? []) as Task[]).filter(
      (task) => task.status === TASK_STATUS_PENDING_APPROVAL,
    ),
  )

  const count = computed(() => tasks.value.length)

  const loading = computed(
    () => tasksSource.value !== null && tasksCollection.pending.value,
  )

  const error = computed(() => {
    if (!tasksCollection.error.value) return null
    console.error('Kunne ikke lytte på oppgaver til godkjenning:', tasksCollection.error.value)
    return 'Kunne ikke laste varsler.'
  })

  function syncForProjects(projectIds: string[]) {
    if (projectIds.length === 0) {
      tasksSource.value = null
      return
    }

    tasksSource.value = query(
      collection(db, TASKS_COLLECTION),
      where('projectId', 'in', projectIds.slice(0, FIRESTORE_IN_QUERY_LIMIT)),
      where('status', '==', TASK_STATUS_PENDING_APPROVAL),
    )
  }

  function unsubscribe() {
    tasksSource.value = null
  }

  return {
    tasks,
    count,
    loading,
    error,
    syncForProjects,
    unsubscribe,
  }
})
