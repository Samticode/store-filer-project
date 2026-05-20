<script setup lang="ts">
import { ref } from 'vue'
import { LayoutGrid, List } from '@lucide/vue'
import TaskBoard from '@/components/TaskBoard.vue'
import TaskList from '@/components/TaskList.vue'
import type { AuthUser, Task } from '@/types'

type TaskViewMode = 'board' | 'list'

defineProps<{
  tasks: Task[]
  users: AuthUser[]
  loading?: boolean
  error?: string | null
}>()

const taskViewMode = ref<TaskViewMode>('board')
</script>

<template>
  <div>
    <div class="mb-4 hidden justify-start lg:flex">
      <div
        class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1"
        role="tablist"
        aria-label="Oppgavevisning"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="taskViewMode === 'board'"
          class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            taskViewMode === 'board'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          "
          @click="taskViewMode = 'board'"
        >
          <LayoutGrid :size="16" />
          Trello board
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="taskViewMode === 'list'"
          class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            taskViewMode === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          "
          @click="taskViewMode = 'list'"
        >
          <List :size="16" />
          Liste
        </button>
      </div>
    </div>

    <TaskBoard
      :class="taskViewMode === 'list' ? 'lg:hidden' : ''"
      :tasks="tasks"
      :users="users"
      :loading="loading"
      :error="error"
    />

    <TaskList
      v-if="taskViewMode === 'list'"
      class="hidden lg:block"
      :tasks="tasks"
      :users="users"
      :loading="loading"
      :error="error"
    />
  </div>
</template>
