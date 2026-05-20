<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Camera, Paperclip, Send } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import AppSelect from '@/components/AppSelect.vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/users'
import {
  TASK_STATUS_IN_PROGRESS,
  TASK_STATUS_NOT_STARTED,
  TASK_STATUS_PENDING_APPROVAL,
  type TaskStatus,
  hasUserRole,
} from '@/types'
import { formatNorwegianDate } from '@/utils/formatDate'
import {
  taskPriorityBadgeClass,
  taskPriorityLabel,
  taskStatusBadgeClass,
  taskStatusLabel,
} from '@/utils/taskLabels'

const route = useRoute()
const authStore = useAuthStore()
const tasksStore = useTasksStore()
const usersStore = useUsersStore()
const { currentUser } = storeToRefs(authStore)
const { currentTask, currentTaskLoading, currentTaskError, updatingStatus, updateStatusError } =
  storeToRefs(tasksStore)
const { users } = storeToRefs(usersStore)

const taskId = computed(() => route.params.taskId as string)
const statusError = ref<string | null>(null)
const updateDraft = ref('')
const optionalStatus = ref('')

const isAssignedEmployee = computed(
  () =>
    currentUser.value !== null &&
    hasUserRole(currentUser.value) &&
    currentUser.value.role === 'employee' &&
    currentTask.value?.assignedEmployeeId === currentUser.value.id,
)

const userNameById = computed(() =>
  Object.fromEntries(users.value.map((user) => [user.id, user.name])),
)

const assignedName = computed(() => {
  const employeeId = currentTask.value?.assignedEmployeeId
  if (!employeeId) return '—'
  return userNameById.value[employeeId] ?? 'Ukjent'
})

const optionalStatusOptions = computed(() => [
  { value: 'not_started', label: taskStatusLabel('not_started') },
  { value: 'in_progress', label: taskStatusLabel('in_progress') },
  { value: 'pending_approval', label: taskStatusLabel('pending_approval') },
  { value: 'approved', label: taskStatusLabel('approved') },
])

watch(
  taskId,
  (id) => {
    if (id) {
      tasksStore.subscribeTask(id)
    }
  },
  { immediate: true },
)

watch(
  () => currentTask.value?.projectId,
  () => {
    usersStore.subscribeUsers()
  },
  { immediate: true },
)

onUnmounted(() => {
  tasksStore.unsubscribeTaskListener()
  usersStore.unsubscribeUsersListener()
})

async function changeStatus(status: TaskStatus) {
  if (!currentTask.value) return

  statusError.value = null
  try {
    await tasksStore.updateTaskStatus(currentTask.value.id, status)
  } catch {
    statusError.value = tasksStore.updateStatusError
  }
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col px-4 py-8 lg:px-10 lg:py-19">
    <p v-if="currentTaskLoading" class="text-sm text-gray-500">Laster oppgave…</p>
    <p v-else-if="currentTaskError" class="text-sm text-red-600">{{ currentTaskError }}</p>

    <template v-else-if="currentTask">
      <header>
        <h1 class="max-w-5xl line-clamp-2 text-2xl font-semibold text-gray-900 lg:text-3xl">
          {{ currentTask.title }}
        </h1>
      </header>

      <section class="mt-8 grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <article class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div class="border-b border-gray-200 px-5 py-4">
              <h2 class="text-sm font-semibold text-gray-900">Beskrivelse</h2>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm leading-relaxed text-gray-600">
                {{ currentTask.description || 'Ingen beskrivelse.' }}
              </p>
            </div>
          </article>

          <article
            v-if="isAssignedEmployee"
            class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div class="border-b border-gray-200 px-5 py-4">
              <h2 class="text-sm font-semibold text-gray-900">Endre status</h2>
            </div>
            <div class="px-5 py-4">
              <p v-if="currentTask.status === 'approved'" class="text-sm text-gray-500">
                Oppgaven er godkjent og videre arbeid er låst.
              </p>

              <div v-else class="flex gap-2 sm:gap-3">
                <button
                  v-if="currentTask.status === 'not_started'"
                  type="button"
                  class="min-w-0 flex-1 rounded-md bg-green-800 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60 sm:px-4 lg:flex-none lg:px-6"
                  :disabled="updatingStatus"
                  @click="changeStatus(TASK_STATUS_IN_PROGRESS)"
                >
                  Begynn oppgave
                </button>

                <template v-else-if="currentTask.status === 'in_progress'">
                  <button
                    type="button"
                    class="min-w-0 flex-1 rounded-md bg-green-800 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60 sm:px-4 lg:flex-none lg:px-6"
                    :disabled="updatingStatus"
                    @click="changeStatus(TASK_STATUS_PENDING_APPROVAL)"
                  >
                    Fullfør oppgave
                  </button>
                  <button
                    type="button"
                    class="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60 sm:px-4 lg:flex-none lg:px-6"
                    :disabled="updatingStatus"
                    @click="changeStatus(TASK_STATUS_NOT_STARTED)"
                  >
                    Ta tilbake til ikke startet
                  </button>
                </template>

                <button
                  v-else-if="currentTask.status === 'pending_approval'"
                  type="button"
                  class="min-w-0 flex-1 rounded-md bg-green-800 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60 sm:px-4 lg:flex-none lg:px-6"
                  :disabled="updatingStatus"
                  @click="changeStatus(TASK_STATUS_IN_PROGRESS)"
                >
                  Fortsett arbeid
                </button>
              </div>

              <p v-if="statusError || updateStatusError" class="mt-3 text-sm text-red-600">
                {{ statusError || updateStatusError }}
              </p>
            </div>
          </article>

          <article class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div class="border-b border-gray-200 px-5 py-4">
              <h2 class="text-sm font-semibold text-gray-900">Oppdateringslogg</h2>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-500">Ingen oppdateringer for øyeblikket.</p>
            </div>
          </article>

          <article
            v-if="isAssignedEmployee"
            class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div class="border-b border-gray-200 px-5 py-4">
              <h2 class="text-sm font-semibold text-gray-900">Ny oppdatering</h2>
            </div>
            <div class="px-5 py-4">
              <p v-if="currentTask.status === 'not_started'" class="text-sm text-gray-500">
                Start oppgaven før du kan legge til oppdateringer.
              </p>
              <p v-else-if="currentTask.status === 'approved'" class="text-sm text-gray-500">
                Oppgaven er godkjent og videre arbeid er låst.
              </p>
              <p v-else-if="currentTask.status === 'pending_approval'" class="text-sm text-gray-500">
                Oppgaven venter på godkjenning og nye oppdateringer kan ikke legges til.
              </p>

              <div v-else-if="currentTask.status === 'in_progress'" class="space-y-4">
              <textarea
                v-model="updateDraft"
                rows="4"
                placeholder="Hva har du gjort?"
                class="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700"
              />

              <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div class="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    <Camera :size="16" />
                    Bilde
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    <Paperclip :size="16" />
                    Fil
                  </button>
                  <div class="w-full min-w-48 sm:w-56">
                    <AppSelect
                      v-model="optionalStatus"
                      placeholder="Endre status (valgfritt)"
                      :options="optionalStatusOptions"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  class="inline-flex items-center justify-center gap-2 rounded-md bg-green-800 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 lg:shrink-0"
                >
                  <Send :size="16" />
                  Send oppdatering
                </button>
              </div>
              </div>
            </div>
          </article>
        </div>

        <article class="h-fit overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div class="border-b border-gray-200 px-5 py-4">
            <h2 class="text-sm font-semibold text-gray-900">Detaljer</h2>
          </div>
          <dl class="divide-y divide-gray-100">
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <dt class="text-sm text-gray-500">Status</dt>
              <dd>
                <span
                  class="inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium"
                  :class="taskStatusBadgeClass(currentTask.status)"
                >
                  {{ taskStatusLabel(currentTask.status) }}
                </span>
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <dt class="text-sm text-gray-500">Kritikalitet</dt>
              <dd>
                <span
                  class="inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium"
                  :class="taskPriorityBadgeClass(currentTask.priority)"
                >
                  {{ taskPriorityLabel(currentTask.priority) }}
                </span>
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <dt class="text-sm text-gray-500">Tildelt til</dt>
              <dd class="text-sm font-medium text-gray-900">{{ assignedName }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <dt class="text-sm text-gray-500">Opprettet</dt>
              <dd class="text-sm font-medium text-gray-900">
                {{ formatNorwegianDate(currentTask.createdAt) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-5 py-3">
              <dt class="text-sm text-gray-500">Oppdatert</dt>
              <dd class="text-sm font-medium text-gray-900">
                {{ formatNorwegianDate(currentTask.updatedAt) }}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </template>
  </div>
</template>
