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
  type CollectionReference,
  type Query,
} from 'firebase/firestore'
import { useCollection, useDocument, useFirestore } from 'vuefire'
import { PROJECTS_COLLECTION, PROJECT_STATUS_ACTIVE, type Project, type ProjectData, type ProjectUpdateData } from '@/types'

function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
}

export const useProjectsStore = defineStore('projects', () => {
  const db = useFirestore()
  const creating = ref(false)
  const updating = ref(false)
  const createError = ref<string | null>(null)
  const updateError = ref<string | null>(null)

  const projectsSource = ref<CollectionReference | Query | null>(null)
  const projectsCollection = useCollection<Project>(projectsSource)

  const currentProjectId = ref<string | null>(null)
  const currentProjectSource = computed(() =>
    currentProjectId.value ? doc(db, PROJECTS_COLLECTION, currentProjectId.value) : null,
  )
  const currentProjectDoc = useDocument<Project>(currentProjectSource)

  const projects = computed(() => sortProjects((projectsCollection.value ?? []) as Project[]))

  const loading = computed(
    () => projectsSource.value !== null && projectsCollection.pending.value,
  )

  const error = computed(() => {
    if (!projectsCollection.error.value) return null
    console.error('Kunne ikke lytte på prosjekter:', projectsCollection.error.value)
    return 'Kunne ikke laste prosjekter. Prøv igjen senere.'
  })

  const currentProject = computed(() => (currentProjectDoc.value as Project | null | undefined) ?? null)

  const currentProjectLoading = computed(
    () => currentProjectId.value !== null && currentProjectDoc.pending.value,
  )

  const currentProjectError = computed(() => {
    if (currentProjectDoc.error.value) {
      console.error('Kunne ikke lytte på prosjekt:', currentProjectDoc.error.value)
      return 'Kunne ikke laste prosjekt. Prøv igjen senere.'
    }
    if (
      currentProjectId.value &&
      !currentProjectDoc.pending.value &&
      currentProjectDoc.value == null
    ) {
      return 'Prosjektet ble ikke funnet.'
    }
    return null
  })

  function subscribeProjects() {
    projectsSource.value = collection(db, PROJECTS_COLLECTION)
  }

  function subscribeLeaderProjects(leaderId: string) {
    projectsSource.value = query(
      collection(db, PROJECTS_COLLECTION),
      where('projectLeaderId', '==', leaderId),
    )
  }

  function unsubscribeProjectsListener() {
    projectsSource.value = null
  }

  function subscribeProject(projectId: string) {
    currentProjectId.value = projectId
  }

  function unsubscribeProjectListener() {
    currentProjectId.value = null
  }

  async function updateProject(projectId: string, data: ProjectUpdateData) {
    updating.value = true
    updateError.value = null
    try {
      await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Kunne ikke oppdatere prosjekt:', e)
      updateError.value = 'Kunne ikke oppdatere prosjekt. Prøv igjen.'
      throw e
    } finally {
      updating.value = false
    }
  }

  async function createProject(data: ProjectData) {
    creating.value = true
    createError.value = null
    try {
      await addDoc(collection(db, PROJECTS_COLLECTION), {
        ...data,
        status: PROJECT_STATUS_ACTIVE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Kunne ikke opprette prosjekt:', e)
      createError.value = 'Kunne ikke opprette prosjekt. Prøv igjen.'
      throw e
    } finally {
      creating.value = false
    }
  }

  return {
    projects,
    currentProject,
    loading,
    currentProjectLoading,
    creating,
    updating,
    error,
    currentProjectError,
    createError,
    updateError,
    subscribeProjects,
    subscribeLeaderProjects,
    unsubscribeProjectsListener,
    subscribeProject,
    unsubscribeProjectListener,
    createProject,
    updateProject,
  }
})
