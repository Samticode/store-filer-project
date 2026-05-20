<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Pencil } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import EditProjectModal, { type EditProjectPayload } from '@/components/EditProjectModal.vue'
import { useProjectsStore } from '@/stores/projects'
import { useUsersStore } from '@/stores/users'

const route = useRoute()
const projectsStore = useProjectsStore()
const usersStore = useUsersStore()
const { currentProject, currentProjectLoading, currentProjectError, updating } =
  storeToRefs(projectsStore)
const { projectLeaders, loading: usersLoading, error: usersError } = storeToRefs(usersStore)

const projectId = computed(() => route.params.projectId as string)
const isEditModalOpen = ref(false)
const editError = ref<string | null>(null)

watch(
  projectId,
  (id) => {
    if (id) projectsStore.subscribeProject(id)
  },
  { immediate: true },
)

onMounted(() => {
  usersStore.subscribeUsers()
})

onUnmounted(() => {
  projectsStore.unsubscribeProjectListener()
  usersStore.unsubscribeUsersListener()
})

function openEditModal() {
  editError.value = null
  isEditModalOpen.value = true
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
          type="button"
          class="flex w-full shrink-0 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 lg:w-auto"
          @click="openEditModal"
        >
          <Pencil :size="16" />
          <span>Rediger</span>
        </button>
      </header>

      <section class="mt-8" />
    </template>

    <EditProjectModal
      v-model="isEditModalOpen"
      :project="currentProject"
      :project-leaders="projectLeaders"
      :leaders-loading="usersLoading"
      :leaders-error="usersError"
      :saving="updating"
      :error="editError"
      @save="handleSave"
    />
  </div>
</template>
