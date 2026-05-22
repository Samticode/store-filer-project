<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import TaskBoardCard from '@/components/TaskBoardCard.vue'
import { useUsersStore } from '@/stores/users'
import type { AuthUser, Task, TaskStatus } from '@/types'
import { TASK_STATUSES } from '@/types'
import { taskStatusLabel } from '@/utils/taskLabels'

const props = defineProps<{
  tasks: Task[]
  users: AuthUser[]
  loading?: boolean
  error?: string | null
}>()

const { userNameById } = storeToRefs(useUsersStore())

const tasksByStatus = computed(() => {
  const grouped = Object.fromEntries(TASK_STATUSES.map((status) => [status, [] as Task[]])) as Record<
    TaskStatus,
    Task[]
  >

  for (const task of props.tasks) {
    grouped[task.status]?.push(task)
  }

  return grouped
})

function assignedEmployeeName(employeeId: string) {
  return userNameById.value[employeeId] ?? 'Ukjent'
}
</script>

<template>
  <div>
    <p v-if="loading" class="text-sm text-gray-500">Laster oppgaver…</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div
      v-else
      class="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-4"
    >
    <section
      v-for="status in TASK_STATUSES"
      :key="status"
      class="flex min-w-[260px] flex-col rounded-lg bg-gray-50 p-3"
    >
      <header class="mb-3 flex items-center justify-between gap-2 px-1">
        <h3 class="text-sm font-semibold text-gray-900">
          {{ taskStatusLabel(status) }}
        </h3>
        <span class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-700">
          {{ tasksByStatus[status].length }}
        </span>
      </header>

      <div class="flex flex-1 flex-col gap-2">
        <TaskBoardCard
          v-for="task in tasksByStatus[status]"
          :key="task.id"
          :task="task"
          :assigned-employee-name="assignedEmployeeName(task.assignedEmployeeId)"
        />

        <p
          v-if="tasksByStatus[status].length === 0"
          class="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400"
        >
          Ingen oppgaver
        </p>
      </div>
    </section>
    </div>
  </div>
</template>
