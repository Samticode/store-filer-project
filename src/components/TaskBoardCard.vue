<script setup lang="ts">
import type { Task } from '@/types'
import { taskPriorityBadgeClass, taskPriorityLabel } from '@/utils/taskLabels'
import UserAvatar from '@/components/UserAvatar.vue'

defineProps<{
  task: Task
  assignedEmployeeName: string
}>()
</script>

<template>
  <article class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
    <h3 class="text-sm font-semibold text-gray-900 line-clamp-2">
      {{ task.title }}
    </h3>

    <p class="mt-1.5 text-xs text-gray-500 line-clamp-2">
      {{ task.description }}
    </p>

    <div class="mt-3 flex items-center justify-between gap-2">
      <span
        class="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium"
        :class="taskPriorityBadgeClass(task.priority)"
      >
        {{ taskPriorityLabel(task.priority) }}
      </span>

      <div class="flex min-w-0 items-center gap-1.5">
        <UserAvatar :name="assignedEmployeeName" :scale="0.65" />
        <span class="truncate text-xs font-medium text-gray-700">
          {{ assignedEmployeeName }}
        </span>
      </div>
    </div>
  </article>
</template>
