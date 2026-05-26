<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle, Pencil } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import AddTaskModal, { type CreateTaskPayload } from '@/components/AddTaskModal.vue'
import AppConfirmModal from '@/components/AppConfirmModal.vue'
import EditProjectModal, { type EditProjectPayload } from '@/components/EditProjectModal.vue'
import ProjectTasksSection from '@/components/ProjectTasksSection.vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/users'
import { hasUserRole, PROJECT_STATUS_ACTIVE, PROJECT_STATUS_FINISHED } from '@/types'
import { projectStatusBadgeClass, projectStatusLabel } from '@/utils/projectLabels'
import { formatGithubRepoUrl } from '@/utils/github'

const route = useRoute()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const usersStore = useUsersStore()
const { currentUser } = storeToRefs(authStore)
const { currentProject, currentProjectLoading, currentProjectError, updating } =
  storeToRefs(projectsStore)
const { creating: creatingTask, tasks, loading: tasksLoading, error: tasksError } =
  storeToRefs(tasksStore)
const { projectLeaders, employees, users, loading: usersLoading, error: usersError } = storeToRefs(usersStore)

const projectId = computed(() => route.params.projectId as string)
const canEdit = computed(
  () => currentUser.value !== null && hasUserRole(currentUser.value) && currentUser.value.role === 'management',
)
const canCreateTasks = computed(
  () =>
    currentUser.value !== null &&
    hasUserRole(currentUser.value) &&
    currentUser.value.role === 'projectLeader' &&
    currentProject.value?.projectLeaderId === currentUser.value.id,
)
const isProjectActive = computed(() => currentProject.value?.status === PROJECT_STATUS_ACTIVE)
const hasGithubRepo = computed(
  () => Boolean(currentProject.value?.githubRepo && currentProject.value.githubRepo.length > 0),
)
const canFinishProject = computed(
  () => canEdit.value && currentProject.value?.status !== PROJECT_STATUS_FINISHED,
)
const newTaskDisabledTooltip = 'Statusen er ikke aktiv, nye oppgaver er pauset.'

const isEditModalOpen = ref(false)
const isFinishConfirmOpen = ref(false)
const isAddTaskModalOpen = ref(false)
const editError = ref<string | null>(null)
const finishError = ref<string | null>(null)
const createTaskError = ref<string | null>(null)

watch(
  projectId,
  (id) => {
    if (id) {
      projectsStore.subscribeProject(id)
      tasksStore.subscribeProjectTasks(id)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  projectsStore.unsubscribeProjectListener()
  tasksStore.unsubscribeTasksListener()
})

function openEditModal() {
  editError.value = null
  isEditModalOpen.value = true
}

function openAddTaskModal() {
  if (!isProjectActive.value) return
  createTaskError.value = null
  isAddTaskModalOpen.value = true
}

function openFinishConfirm() {
  finishError.value = null
  isFinishConfirmOpen.value = true
}

async function handleFinishProject() {
  if (!currentProject.value) return

  finishError.value = null
  try {
    await projectsStore.updateProject(currentProject.value.id, {
      name: currentProject.value.name,
      description: currentProject.value.description,
      projectLeaderId: currentProject.value.projectLeaderId,
      status: PROJECT_STATUS_FINISHED,
      githubRepo: currentProject.value.githubRepo ?? null,
    })
    isFinishConfirmOpen.value = false
  } catch {
    finishError.value = projectsStore.updateError
  }
}

async function handleSave(payload: EditProjectPayload) {
  if (!currentProject.value) return

  editError.value = null
  try {
    await projectsStore.updateProject(currentProject.value.id, payload)
    isEditModalOpen.value = false
  } catch {
    editError.value = projectsStore.updateError
  }
}

async function handleCreateTask(payload: CreateTaskPayload) {
  if (!currentProject.value || !currentUser.value) return

  createTaskError.value = null
  try {
    await tasksStore.createTask(currentProject.value.id, currentUser.value.id, payload)
    isAddTaskModalOpen.value = false
  } catch {
    createTaskError.value = tasksStore.createError
  }
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col px-4 py-8 lg:px-10 lg:py-19">
    <p v-if="currentProjectLoading" class="text-sm text-gray-500">Laster prosjekt…</p>
    <p v-else-if="currentProjectError" class="text-sm text-red-600">{{ currentProjectError }}</p>

    <template v-else-if="currentProject">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="min-w-0 space-y-2">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="max-w-5xl line-clamp-2 text-2xl font-semibold text-gray-900 lg:text-3xl">
              {{ currentProject.name }}
            </h1>
            <span
              class="inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium"
              :class="projectStatusBadgeClass(currentProject.status)"
            >
              {{ projectStatusLabel(currentProject.status) }}
            </span>
          </div>
          <p class="max-w-6xl line-clamp-4 text-sm text-gray-500">
            {{ currentProject.description }}
          </p>
          <p v-if="currentProject.githubRepo" class="text-sm">
            <a
              :href="formatGithubRepoUrl(currentProject.githubRepo)"
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium text-violet-700 hover:text-violet-600"
            >
              {{ formatGithubRepoUrl(currentProject.githubRepo) }}
            </a>
          </p>
        </div>
        <div v-if="canEdit" class="flex w-full shrink-0 flex-col gap-2 lg:w-auto">
          <div class="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:w-auto"
              @click="openEditModal"
            >
              <Pencil :size="16" />
              <span>Rediger</span>
            </button>
            <button
              v-if="canFinishProject"
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-green-800 px-8 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"

              :disabled="updating"
              @click="openFinishConfirm"
            >
              <CheckCircle :size="16" />
              <span>Marker som fullført</span>
            </button>
          </div>
        </div>
        <div
          v-else-if="canCreateTasks"
          class="group relative inline-flex w-full lg:w-auto"
        >
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
            :disabled="!isProjectActive"
            @click="openAddTaskModal"
          >
            <span class="text-lg">+</span>
            <span>Ny oppgave</span>
          </button>
          <span
            v-if="!isProjectActive"
            role="tooltip"
            class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max max-w-56 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-1.5 text-center text-xs text-white group-hover:block"
          >
            {{ newTaskDisabledTooltip }}
          </span>
        </div>
      </header>

      <section class="mt-8">
        <ProjectTasksSection
          :tasks="tasks"
          :users="users"
          :loading="tasksLoading"
          :error="tasksError"
        />
      </section>
    </template>

    <AppConfirmModal
      v-if="canEdit"
      v-model="isFinishConfirmOpen"
      title="Marker prosjekt som fullført?"
      description="Prosjektlederen kan ikke lenger opprette nye oppgaver. Du kan gjenåpne prosjektet senere via Rediger."
      confirm-label="Marker som fullført"
      :loading="updating"
      :error="finishError"
      @confirm="handleFinishProject"
    />

    <EditProjectModal
      v-if="canEdit"
      v-model="isEditModalOpen"
      :project="currentProject"
      :project-leaders="projectLeaders"
      :leaders-loading="usersLoading"
      :leaders-error="usersError"
      :saving="updating"
      :error="editError"
      @save="handleSave"
    />

    <AddTaskModal
      v-if="canCreateTasks"
      v-model="isAddTaskModalOpen"
      :employees="employees"
      :employees-loading="usersLoading"
      :employees-error="usersError"
      :has-github-repo="hasGithubRepo"
      :saving="creatingTask"
      :error="createTaskError"
      @save="handleCreateTask"
    />
  </div>
</template>
