<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Project } from '@/types'
import { formatNorwegianDate } from '@/utils/formatDate'
import { projectStatusBadgeClass, projectStatusLabel } from '@/utils/projectLabels'
import { projectRouteNameForUser } from '@/utils/roleRoutes'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  project: Project
  leaderName: string
}>()

const { currentUser } = storeToRefs(useAuthStore())

const projectRouteName = computed(() => projectRouteNameForUser(currentUser.value))
</script>

<template>
  <RouterLink
    :to="{ name: projectRouteName, params: { projectId: project.id } }"
    class="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
  >
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-base font-semibold text-gray-900 line-clamp-2">
        {{ project.name }}
      </h3>
      <span
        class="inline-flex shrink-0 items-center rounded-sm px-2.5 py-0.5 text-xs font-medium"
        :class="projectStatusBadgeClass(project.status)"
      >
        {{ projectStatusLabel(project.status) }}
      </span>
    </div>

    <p class="mt-3 flex-1 text-sm text-gray-500 line-clamp-2">
      {{ project.description }}
    </p>

    <div class="mt-4 flex justify-between items-center border-t border-gray-100 pt-4 text-sm">
      <div class="flex items-center gap-2">
        <UserAvatar :name="leaderName" :scale="0.9" />
        <p class="text-right font-medium text-gray-900">
          {{ leaderName }}
        </p>
      </div>
      <p class="text-right text-gray-900">
        {{ formatNorwegianDate(project.createdAt) }}
      </p>
    </div>
  </RouterLink>
</template>
