<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { LayoutGrid, List } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import AddProjectModal, { type CreateProjectPayload } from '@/components/AddProjectModal.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import ProjectList from '@/components/ProjectList.vue'
import { useProjectsStore } from '@/stores/projects'
import { useUsersStore } from '@/stores/users'
import type { Project } from '@/types'

type ViewMode = 'table' | 'cards'

const usersStore = useUsersStore()
const projectsStore = useProjectsStore()
const { projectLeaders, userNameById, loading: usersLoading, error: usersError } = storeToRefs(usersStore)
const { projects, loading, error, creating } = storeToRefs(projectsStore)

const isAddModalOpen = ref(false)
const createError = ref<string | null>(null)
const viewMode = ref<ViewMode>('table')

function leaderName(project: Project) {
  return userNameById.value[project.projectLeaderId] ?? 'Ukjent'
}

onMounted(() => {
  projectsStore.subscribeProjects()
})

watch(
  () => [...new Set(projects.value.map((project) => project.projectLeaderId))],
  (leaderIds) => {
    usersStore.syncLiveUserNameWatchers(leaderIds)
  },
  { immediate: true },
)

onUnmounted(() => {
  projectsStore.unsubscribeProjectsListener()
  usersStore.clearLiveUserNameWatchers()
})

function openAddModal() {
  createError.value = null
  isAddModalOpen.value = true
}

async function handleCreateProject(payload: CreateProjectPayload) {
  createError.value = null
  try {
    await projectsStore.createProject(payload)
    isAddModalOpen.value = false
  } catch {
    createError.value = projectsStore.createError
  }
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col px-4 py-8 lg:px-10 lg:py-19">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold text-gray-900 lg:text-3xl">Alle prosjekter</h1>
        <p class="text-sm text-gray-500">
          Her kan du se alle prosjektene for Store Filer AS.
        </p>
      </div>
      <button
        type="button"
        class="flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-green-800 px-8 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 hover:shadow-md active:bg-green-900 active:shadow-sm lg:w-auto"
        @click="openAddModal"
      >
        <span class="text-lg">+</span>
        <span>Legg til prosjekt</span>
      </button>
    </header>

    <section class="mt-8">
      <p v-if="loading" class="text-sm text-gray-500">Laster prosjekter…</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="projects.length === 0" class="text-sm text-gray-500">Ingen prosjekter funnet.</p>

      <template v-else>
        <div class="mb-4 hidden justify-start lg:flex">
          <div
            class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1"
            role="tablist"
            aria-label="Visningsmodus"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="viewMode === 'table'"
              class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              :class="
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              "
              @click="viewMode = 'table'"
            >
              <List :size="16" />
              Liste
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="viewMode === 'cards'"
              class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              :class="
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              "
              @click="viewMode = 'cards'"
            >
              <LayoutGrid :size="16" />
              Kort
            </button>
          </div>
        </div>

        <ProjectList v-if="viewMode === 'table'" :projects="projects" />

        <div
          v-else-if="viewMode === 'cards'"
          class="grid gap-4 max-lg:grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
        >
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            :leader-name="leaderName(project)"
          />
        </div>
      </template>
    </section>

    <AddProjectModal
      v-model="isAddModalOpen"
      :project-leaders="projectLeaders"
      :leaders-loading="usersLoading"
      :leaders-error="usersError"
      :saving="creating"
      :error="createError"
      @save="handleCreateProject"
    />
  </div>
</template>
