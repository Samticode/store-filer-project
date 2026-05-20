<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Pencil } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import AddTaskModal, { type CreateTaskPayload } from '@/components/AddTaskModal.vue'
import EditProjectModal, { type EditProjectPayload } from '@/components/EditProjectModal.vue'
import ProjectTasksSection from '@/components/ProjectTasksSection.vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/users'
import { hasUserRole } from '@/types'

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

const isEditModalOpen = ref(false)
const isAddTaskModalOpen = ref(false)
const editError = ref<string | null>(null)
const createTaskError = ref<string | null>(null)

watch(
  projectId,
  (id) => {
    if (id) {
      projectsStore.subscribeProject(id)
      tasksStore.subscribeProjectTasks(id)
      usersStore.subscribeUsers()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  projectsStore.unsubscribeProjectListener()
  tasksStore.unsubscribeTasksListener()
  usersStore.unsubscribeUsersListener()
})

function openEditModal() {
  editError.value = null
  isEditModalOpen.value = true
}

function openAddTaskModal() {
  createTaskError.value = null
  isAddTaskModalOpen.value = true
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
          <h1 class="max-w-5xl line-clamp-2 text-2xl font-semibold text-gray-900 lg:text-3xl">
            {{ currentProject.name }}
          </h1>
          <p class="max-w-6xl line-clamp-4 text-sm text-gray-500">
            {{ currentProject.description }}
          </p>
        </div>
        <button
          v-if="canEdit"
          type="button"
          class="flex w-full shrink-0 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 lg:w-auto"
          @click="openEditModal"
        >
          <Pencil :size="16" />
          <span>Rediger</span>
        </button>
        <button
          v-else-if="canCreateTasks"
          type="button"
          class="flex w-full shrink-0 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 lg:w-auto"
          @click="openAddTaskModal"
        >
          <span class="text-lg">+</span>
          <span>Ny oppgave</span>
        </button>
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
      :saving="creatingTask"
      :error="createTaskError"
      @save="handleCreateTask"
    />
  </div>
</template>
