import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { firebaseApp } from '@/firebase'
import { PROJECTS_COLLECTION, PROJECT_STATUS_ACTIVE, type Project, type ProjectData } from '@/types'

const db = getFirestore(firebaseApp)

function projectsFromSnapshot(docs: { id: string; data: () => Record<string, unknown> }[]): Project[] {
  const loaded = docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Project,
  )
  loaded.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
  return loaded
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const currentProjectLoading = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const error = ref<string | null>(null)
  const currentProjectError = ref<string | null>(null)
  const createError = ref<string | null>(null)
  const updateError = ref<string | null>(null)

  let unsubscribeProjects: Unsubscribe | null = null
  let unsubscribeProject: Unsubscribe | null = null

  function subscribeProjects() {
    if (unsubscribeProjects) return

    loading.value = true
    error.value = null

    unsubscribeProjects = onSnapshot(
      collection(db, PROJECTS_COLLECTION),
      (snapshot) => {
        projects.value = projectsFromSnapshot(snapshot.docs)
        loading.value = false
        error.value = null
      },
      (e) => {
        console.error('Kunne ikke lytte på prosjekter:', e)
        error.value = 'Kunne ikke laste prosjekter. Prøv igjen senere.'
        projects.value = []
        loading.value = false
      },
    )
  }

  function unsubscribeProjectsListener() {
    unsubscribeProjects?.()
    unsubscribeProjects = null
  }

  function subscribeProject(projectId: string) {
    unsubscribeProjectListener()

    currentProjectLoading.value = true
    currentProjectError.value = null
    currentProject.value = null

    unsubscribeProject = onSnapshot(
      doc(db, PROJECTS_COLLECTION, projectId),
      (snapshot) => {
        if (snapshot.exists()) {
          currentProject.value = { id: snapshot.id, ...snapshot.data() } as Project
          currentProjectError.value = null
        } else {
          currentProject.value = null
          currentProjectError.value = 'Prosjektet ble ikke funnet.'
        }
        currentProjectLoading.value = false
      },
      (e) => {
        console.error('Kunne ikke lytte på prosjekt:', e)
        currentProjectError.value = 'Kunne ikke laste prosjekt. Prøv igjen senere.'
        currentProject.value = null
        currentProjectLoading.value = false
      },
    )
  }

  function unsubscribeProjectListener() {
    unsubscribeProject?.()
    unsubscribeProject = null
    currentProject.value = null
    currentProjectError.value = null
    currentProjectLoading.value = false
  }

  async function updateProject(projectId: string, data: ProjectData) {
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
    unsubscribeProjectsListener,
    subscribeProject,
    unsubscribeProjectListener,
    createProject,
    updateProject,
  }
})
