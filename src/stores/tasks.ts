import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  type Query,
} from 'firebase/firestore'
import { useCollection, useDocument, useFirestore } from 'vuefire'
import { TASKS_COLLECTION, PROJECTS_COLLECTION, type Task, type TaskData, type TaskStatus } from '@/types'

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
}

export const useTasksStore = defineStore('tasks', () => {
  const db = useFirestore()
  const creating = ref(false)
  const createError = ref<string | null>(null)
  const updatingStatus = ref(false)
  const updateStatusError = ref<string | null>(null)
  const updating = ref(false)
  const updateError = ref<string | null>(null)

  const tasksSource = ref<Query | null>(null)
  const tasksCollection = useCollection<Task>(tasksSource)

  const currentTaskId = ref<string | null>(null)
  const currentTaskSource = computed(() =>
    currentTaskId.value ? doc(db, TASKS_COLLECTION, currentTaskId.value) : null,
  )
  const currentTaskDoc = useDocument<Task>(currentTaskSource)

  const tasks = computed(() => sortTasks((tasksCollection.value ?? []) as Task[]))

  const currentTask = computed(
    () => (currentTaskDoc.value as Task | null | undefined) ?? null,
  )

  const currentTaskLoading = computed(
    () => currentTaskId.value !== null && currentTaskDoc.pending.value,
  )

  const currentTaskError = computed(() => {
    if (currentTaskDoc.error.value) {
      console.error('Kunne ikke lytte på oppgave:', currentTaskDoc.error.value)
      return 'Kunne ikke laste oppgave. Prøv igjen senere.'
    }
    if (
      currentTaskId.value &&
      !currentTaskDoc.pending.value &&
      currentTaskDoc.value == null
    ) {
      return 'Oppgaven ble ikke funnet.'
    }
    return null
  })

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

  function subscribeTask(taskId: string) {
    currentTaskId.value = taskId
  }

  function unsubscribeTaskListener() {
    currentTaskId.value = null
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

      await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
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

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    updatingStatus.value = true
    updateStatusError.value = null
    try {
      await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
        status,
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Kunne ikke oppdatere oppgavestatus:', e)
      updateStatusError.value = 'Kunne ikke oppdatere status. Prøv igjen.'
      throw e
    } finally {
      updatingStatus.value = false
    }
  }

  async function updateTask(taskId: string, projectId: string, data: TaskData) {
    updating.value = true
    updateError.value = null
    try {
      await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
        ...data,
        updatedAt: serverTimestamp(),
      })

      await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Kunne ikke oppdatere oppgave:', e)
      updateError.value = 'Kunne ikke oppdatere oppgave. Prøv igjen.'
      throw e
    } finally {
      updating.value = false
    }
  }

  return {
    tasks,
    currentTask,
    loading,
    currentTaskLoading,
    creating,
    updatingStatus,
    updating,
    error,
    currentTaskError,
    createError,
    updateStatusError,
    updateError,
    subscribeProjectTasks,
    subscribeEmployeeTasks,
    unsubscribeTasksListener,
    subscribeTask,
    unsubscribeTaskListener,
    createTask,
    updateTaskStatus,
    updateTask,
  }
})
