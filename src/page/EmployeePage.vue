<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ProjectTasksSection from '@/components/ProjectTasksSection.vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/users'

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const usersStore = useUsersStore()
const { currentUser } = storeToRefs(authStore)
const { tasks, loading: tasksLoading, error: tasksError } = storeToRefs(tasksStore)
const { users } = storeToRefs(usersStore)

const usersForDisplay = computed(() => {
  if (!currentUser.value) return users.value
  if (users.value.some((user) => user.id === currentUser.value!.id)) {
    return users.value
  }
  return [currentUser.value, ...users.value]
})

watch(
  () => currentUser.value?.id,
  (employeeId) => {
    if (employeeId) {
      tasksStore.subscribeEmployeeTasks(employeeId)
      usersStore.subscribeEmployeeTaskUsers()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  tasksStore.unsubscribeTasksListener()
  usersStore.unsubscribeUsersListener()
})
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col px-4 py-8 lg:px-10 lg:py-19">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold text-gray-900 lg:text-3xl">Alle dine oppgaver</h1>
      <p class="text-sm text-gray-500">
        Her kan du se alle oppgavene som er tildelt deg.
      </p>
    </header>

    <section class="mt-8">
      <ProjectTasksSection
        :tasks="tasks"
        :users="usersForDisplay"
        :loading="tasksLoading"
        :error="tasksError"
      />
    </section>
  </div>
</template>
