<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { LayoutGrid, List } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import ProjectCard from '@/components/ProjectCard.vue'
import ProjectList from '@/components/ProjectList.vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import type { Project } from '@/types'

type ViewMode = 'table' | 'cards'

const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const { currentUser } = storeToRefs(authStore)
const { projects, loading, error } = storeToRefs(projectsStore)

const viewMode = ref<ViewMode>('table')

const usersForDisplay = computed(() => (currentUser.value ? [currentUser.value] : []))

function leaderName(project: Project) {
  return currentUser.value?.id === project.projectLeaderId
    ? (currentUser.value.name ?? 'Ukjent')
    : 'Ukjent'
}

onMounted(() => {
  if (currentUser.value) {
    projectsStore.subscribeLeaderProjects(currentUser.value.id)
  }
})

onUnmounted(() => {
  projectsStore.unsubscribeProjectsListener()
})
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col px-4 py-8 lg:px-10 lg:py-19">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold text-gray-900 lg:text-3xl">Mine Prosjekter</h1>
      <p class="text-sm text-gray-500">
        Her kan du se alle prosjektene du er leder over i Store Filer AS
      </p>
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

        <ProjectList v-if="viewMode === 'table'" :projects="projects" :users="usersForDisplay" />

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
  </div>
</template>
