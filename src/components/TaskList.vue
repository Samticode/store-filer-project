<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import type { AuthUser, Task } from '@/types'
import { taskRouteForTask } from '@/utils/roleRoutes'
import { formatNorwegianDate } from '@/utils/formatDate'
import {
  taskPriorityBadgeClass,
  taskPriorityLabel,
  taskStatusBadgeClass,
  taskStatusLabel,
} from '@/utils/taskLabels'

defineProps<{
  tasks: Task[]
  users: AuthUser[]
  loading?: boolean
  error?: string | null
}>()

const router = useRouter()
const { currentUser } = storeToRefs(useAuthStore())
const { userNameById } = storeToRefs(useUsersStore())

function userName(userId: string | null) {
  if (!userId) return '—'
  return userNameById.value[userId] ?? 'Ukjent'
}

function taskRoute(task: Task) {
  return taskRouteForTask(currentUser.value, task)
}

function openTask(task: Task) {
  router.push(taskRoute(task)!)
}
</script>

<template>
  <div>
  <p v-if="loading" class="text-sm text-gray-500">Laster oppgaver…</p>
  <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
  <p v-else-if="tasks.length === 0" class="text-sm text-gray-500">Ingen oppgaver funnet.</p>

  <template v-else>
    <div class="space-y-3 lg:hidden">
      <RouterLink
        v-for="task in tasks"
        :key="task.id"
        :to="taskRoute(task)!"
        class="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-sm font-semibold text-gray-900 line-clamp-2">
            {{ task.title }}
          </h3>
          <div class="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            <span
              class="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium"
              :class="taskPriorityBadgeClass(task.priority)"
            >
              {{ taskPriorityLabel(task.priority) }}
            </span>
            <span
              class="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium"
              :class="taskStatusBadgeClass(task.status)"
            >
              {{ taskStatusLabel(task.status) }}
            </span>
          </div>
        </div>

        <p class="mt-2 text-sm text-gray-500 line-clamp-2">
          {{ task.description }}
        </p>

        <div class="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <div class="flex min-w-0 items-center gap-2">
            <UserAvatar :name="userName(task.assignedEmployeeId)" :scale="0.8" />
            <span class="truncate text-sm font-medium text-gray-900">
              {{ userName(task.assignedEmployeeId) }}
            </span>
          </div>
          <span class="shrink-0 text-xs text-gray-500">
            {{ formatNorwegianDate(task.createdAt) }}
          </span>
        </div>
      </RouterLink>
    </div>

    <div class="hidden overflow-hidden rounded-lg border border-gray-200 bg-white lg:block">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Oppgave
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
              Prioritet
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
              Tildelt ansatt
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Opprettet av
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Opprettet
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr
            v-for="task in tasks"
            :key="task.id"
            class="cursor-pointer hover:bg-gray-50"
            @click="openTask(task)"
          >
            <td class="max-w-xs px-6 py-4 text-sm font-medium text-gray-900">
              <p class="line-clamp-2">{{ task.title }}</p>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
              <span
                class="inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium"
                :class="taskStatusBadgeClass(task.status)"
              >
                {{ taskStatusLabel(task.status) }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
              <span
                class="inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium"
                :class="taskPriorityBadgeClass(task.priority)"
              >
                {{ taskPriorityLabel(task.priority) }}
              </span>
            </td>
            <td class="max-w-xs px-6 py-4 text-sm text-gray-500">
              <p class="line-clamp-2">{{ task.description }}</p>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
              <div class="flex items-center gap-2">

                <span>{{ userName(task.assignedEmployeeId) }}</span>
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
              {{ userName(task.createdBy) }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {{ formatNorwegianDate(task.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  </div>
</template>
