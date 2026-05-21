import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  type Firestore,
  type Query,
  type WriteBatch,
} from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import {
  PROJECTS_COLLECTION,
  TASKS_COLLECTION,
  TASK_UPDATES_SUBCOLLECTION,
  TASK_STATUS_APPROVED,
  TASK_STATUS_IN_PROGRESS,
  type CreateTaskUpdateInput,
  type RecordProjectLeaderReviewInput,
  type RecordStatusChangeInput,
  type TaskUpdate,
} from '@/types'
import { uploadTaskUpdateFile, uploadTaskUpdateImage } from '@/utils/taskUpdateStorage'
import { TASK_APPROVAL_UPDATE_TEXT, TASK_REJECTION_UPDATE_TEXT } from '@/utils/taskLabels'

function sortUpdates(updates: TaskUpdate[]) {
  return [...updates].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
}

function touchProjectUpdatedAt(batch: WriteBatch, db: Firestore, projectId: string) {
  batch.update(doc(db, PROJECTS_COLLECTION, projectId), {
    updatedAt: serverTimestamp(),
  })
}

export const useTaskUpdatesStore = defineStore('taskUpdates', () => {
  const db = useFirestore()
  const creating = ref(false)
  const createError = ref<string | null>(null)

  const updatesSource = ref<Query | null>(null)
  const updatesCollection = useCollection<TaskUpdate>(updatesSource)

  const updates = computed(() => sortUpdates((updatesCollection.value ?? []) as TaskUpdate[]))

  const loading = computed(
    () => updatesSource.value !== null && updatesCollection.pending.value,
  )

  const error = computed(() => {
    if (!updatesCollection.error.value) return null
    console.error('Kunne ikke lytte på oppgaveoppdateringer:', updatesCollection.error.value)
    return 'Kunne ikke laste oppdateringslogg. Prøv igjen senere.'
  })

  function subscribeTaskUpdates(taskId: string) {
    updatesSource.value = collection(
      db,
      TASKS_COLLECTION,
      taskId,
      TASK_UPDATES_SUBCOLLECTION,
    )
  }

  function unsubscribeTaskUpdatesListener() {
    updatesSource.value = null
  }

  async function recordProjectLeaderReview(input: RecordProjectLeaderReviewInput) {
    creating.value = true
    createError.value = null

    const approved = input.approved
    const text = approved ? TASK_APPROVAL_UPDATE_TEXT : TASK_REJECTION_UPDATE_TEXT
    const statusChange = approved ? TASK_STATUS_APPROVED : TASK_STATUS_IN_PROGRESS

    try {
      const batch = writeBatch(db)
      const taskRef = doc(db, TASKS_COLLECTION, input.taskId)
      const updateRef = doc(
        collection(db, TASKS_COLLECTION, input.taskId, TASK_UPDATES_SUBCOLLECTION),
      )

      batch.set(updateRef, {
        text,
        createdBy: input.createdBy,
        createdAt: serverTimestamp(),
        statusChange,
        imageUrl: null,
        fileUrl: null,
        fileName: null,
      })

      if (approved) {
        batch.update(taskRef, {
          status: TASK_STATUS_APPROVED,
          approvedBy: input.createdBy,
          approvedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } else {
        batch.update(taskRef, {
          status: TASK_STATUS_IN_PROGRESS,
          updatedAt: serverTimestamp(),
        })
      }

      touchProjectUpdatedAt(batch, db, input.projectId)

      await batch.commit()
    } catch (e) {
      console.error('Kunne ikke behandle oppgavegodkjenning:', e)
      createError.value = approved
        ? 'Kunne ikke godkjenne oppgaven. Prøv igjen.'
        : 'Kunne ikke sende oppgaven tilbake. Prøv igjen.'
      throw e
    } finally {
      creating.value = false
    }
  }

  async function recordStatusChange(input: RecordStatusChangeInput) {
    creating.value = true
    createError.value = null

    try {
      const batch = writeBatch(db)
      const updateRef = doc(
        collection(db, TASKS_COLLECTION, input.taskId, TASK_UPDATES_SUBCOLLECTION),
      )

      batch.set(updateRef, {
        text: input.text,
        createdBy: input.createdBy,
        createdAt: serverTimestamp(),
        statusChange: input.statusChange,
        imageUrl: null,
        fileUrl: null,
        fileName: null,
      })

      batch.update(doc(db, TASKS_COLLECTION, input.taskId), {
        status: input.statusChange,
        updatedAt: serverTimestamp(),
      })

      touchProjectUpdatedAt(batch, db, input.projectId)

      await batch.commit()
    } catch (e) {
      console.error('Kunne ikke registrere statusendring:', e)
      createError.value = 'Kunne ikke oppdatere status. Prøv igjen.'
      throw e
    } finally {
      creating.value = false
    }
  }

  async function createUpdate(input: CreateTaskUpdateInput) {
    creating.value = true
    createError.value = null

    try {
      const updatesCol = collection(
        db,
        TASKS_COLLECTION,
        input.taskId,
        TASK_UPDATES_SUBCOLLECTION,
      )
      const updateRef = doc(updatesCol)
      const updateId = updateRef.id

      let imageUrl: string | null = null
      let fileUrl: string | null = null
      let fileName: string | null = null

      if (input.imageFile) {
        imageUrl = await uploadTaskUpdateImage(input.taskId, updateId, input.imageFile)
      }

      if (input.file) {
        fileUrl = await uploadTaskUpdateFile(input.taskId, updateId, input.file)
        fileName = input.file.name
      }

      await setDoc(updateRef, {
        text: input.text.trim(),
        createdBy: input.createdBy,
        createdAt: serverTimestamp(),
        statusChange: input.statusChange,
        imageUrl,
        fileUrl,
        fileName,
      })

      await updateDoc(doc(db, TASKS_COLLECTION, input.taskId), {
        ...(input.statusChange ? { status: input.statusChange } : {}),
        updatedAt: serverTimestamp(),
      })

      await updateDoc(doc(db, PROJECTS_COLLECTION, input.projectId), {
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Kunne ikke sende oppdatering:', e)
      createError.value = 'Kunne ikke sende oppdatering. Prøv igjen.'
      throw e
    } finally {
      creating.value = false
    }
  }

  return {
    updates,
    loading,
    creating,
    error,
    createError,
    subscribeTaskUpdates,
    unsubscribeTaskUpdatesListener,
    recordProjectLeaderReview,
    recordStatusChange,
    createUpdate,
  }
})
