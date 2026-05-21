<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { AuthUser, Project } from '@/types'
import { formatNorwegianDate } from '@/utils/formatDate'
import { projectStatusBadgeClass, projectStatusLabel } from '@/utils/projectLabels'
import { projectRouteNameForUser } from '@/utils/roleRoutes'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  projects: Project[]
  users: AuthUser[]
}>()

const router = useRouter()
const { currentUser } = storeToRefs(useAuthStore())

const projectRouteName = computed(() => projectRouteNameForUser(currentUser.value))

const leaderNameById = computed(() =>
  Object.fromEntries(props.users.map((user) => [user.id, user.name])),
)

function leaderName(project: Project) {
  return leaderNameById.value[project.projectLeaderId] ?? 'Ukjent'
}

function openProject(project: Project) {
  router.push({ name: projectRouteName.value, params: { projectId: project.id } })
}
</script>

<template>
  <div class="space-y-3 lg:hidden">
    <button
      v-for="project in projects"
      :key="project.id"
      type="button"
      class="w-full rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-gray-50"
      @click="openProject(project)"
    >
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-sm font-semibold text-gray-900 line-clamp-2">
          {{ project.name }}
        </h3>
        <span
          class="inline-flex shrink-0 items-center rounded-sm px-2 py-0.5 text-xs font-medium"
          :class="projectStatusBadgeClass(project.status)"
        >
          {{ projectStatusLabel(project.status) }}
        </span>
      </div>
      <p class="mt-2 text-sm text-gray-500 line-clamp-2">
        {{ project.description }}
      </p>
      <div class="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <div class="flex min-w-0 items-center gap-2">
          <UserAvatar :name="leaderName(project)" :scale="0.8" />
          <span class="truncate text-sm font-medium text-gray-900">
            {{ leaderName(project) }}
          </span>
        </div>
        <span class="shrink-0 text-xs text-gray-500">
          {{ formatNorwegianDate(project.updatedAt) }}
        </span>
      </div>
    </button>
  </div>

  <div class="hidden overflow-hidden rounded-lg border border-gray-200 bg-white lg:block">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            Prosjekt
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            Status
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            Beskrivelse
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            Prosjektleder
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            Opprettet
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            Oppdatert
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr
          v-for="project in projects"
          :key="project.id"
          class="cursor-pointer hover:bg-gray-50"
          @click="openProject(project)"
        >
          <td class="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
            {{ project.name }}
          </td>
          <td class="whitespace-nowrap px-6 py-4 text-sm">
            <span
              class="inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium"
              :class="projectStatusBadgeClass(project.status)"
            >
              {{ projectStatusLabel(project.status) }}
            </span>
          </td>
          <td class="max-w-xs px-6 py-4 text-sm text-gray-500">
            <p class="line-clamp-2">{{ project.description }}</p>
          </td>
          <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
            {{ leaderName(project) }}
          </td>
          <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
            {{ formatNorwegianDate(project.createdAt) }}
          </td>
          <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
            {{ formatNorwegianDate(project.updatedAt) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
