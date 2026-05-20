import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  collection,
  addDoc,
  query,
  where,
  serverTimestamp,
  type Query,
} from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import { TASKS_COLLECTION, type Task, type TaskData } from '@/types'

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
}

export const useTasksStore = defineStore('tasks', () => {
  const db = useFirestore()
  const creating = ref(false)
  const createError = ref<string | null>(null)

  const tasksSource = ref<Query | null>(null)
  const tasksCollection = useCollection<Task>(tasksSource)

  const tasks = computed(() => sortTasks((tasksCollection.value ?? []) as Task[]))

  const loading = computed(() => tasksSource.value !== null && tasksCollection.pending.value)

  const error = computed(() => {
    if (!tasksCollection.error.value) return null
    console.error('Kunne ikke lytte på oppgaver:', tasksCollection.error.value)
    return 'Kunne ikke laste oppgaver. Prøv igjen senere.'
  })

  function subscribeProjectTasks(projectId: string) {
    tasksSource.value = query(
      collection(db, TASKS_COLLECTION),
      where('projectId', '==', projectId),
    )
  }

  function subscribeEmployeeTasks(employeeId: string) {
    tasksSource.value = query(
      collection(db, TASKS_COLLECTION),
      where('assignedEmployeeId', '==', employeeId),
    )
  }

  function unsubscribeTasksListener() {
    tasksSource.value = null
  }

  async function createTask(projectId: string, createdBy: string, data: TaskData) {
    creating.value = true
    createError.value = null
    try {
      await addDoc(collection(db, TASKS_COLLECTION), {
        ...data,
        projectId,
        createdBy,
        approvedBy: null,
        approvedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Kunne ikke opprette oppgave:', e)
      createError.value = 'Kunne ikke opprette oppgave. Prøv igjen.'
      throw e
    } finally {
      creating.value = false
    }
  }

  return {
    tasks,
    loading,
    creating,
    error,
    createError,
    subscribeProjectTasks,
    subscribeEmployeeTasks,
    unsubscribeTasksListener,
    createTask,
  }
})
