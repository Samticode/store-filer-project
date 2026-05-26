<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Camera, Check, Paperclip, Pencil, Send, X } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import AppSelect from '@/components/AppSelect.vue'
import EditTaskModal, { type EditTaskPayload } from '@/components/EditTaskModal.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useTaskUpdatesStore } from '@/stores/taskUpdates'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/users'
import {
  TASK_STATUS_IN_PROGRESS,
  TASK_STATUS_NOT_STARTED,
  TASK_STATUS_PENDING_APPROVAL,
  TASK_STATUS_APPROVED,
  type TaskStatus,
  hasUserRole,
} from '@/types'
import { formatNorwegianDate, formatRelativeTimeNorwegian } from '@/utils/formatDate'
import {
  taskPriorityBadgeClass,
  taskPriorityLabel,
  statusChangeLogText,
  taskStatusBadgeClass,
  taskStatusLabel,
  taskUpdateAttachmentBorderClass,
  taskUpdateCardClass,
  taskUpdateLinkClass,
  taskUpdateStatusTextClass,
} from '@/utils/taskLabels'

const route = useRoute()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const taskUpdatesStore = useTaskUpdatesStore()
const usersStore = useUsersStore()
const { currentUser } = storeToRefs(authStore)
const { currentProject } = storeToRefs(projectsStore)
const { currentTask, currentTaskLoading, currentTaskError, updating } = storeToRefs(tasksStore)
const {
  updates,
  loading: updatesLoading,
  creating: creatingUpdate,
  createError,
  error: updatesError,
} = storeToRefs(taskUpdatesStore)
const { userNameById, employees, loading: usersLoading, error: usersError } = storeToRefs(usersStore)

const taskId = computed(() => route.params.taskId as string)
const statusError = ref<string | null>(null)
const updateDraft = ref('')
const optionalStatus = ref('')
const selectedImage = ref<File | null>(null)
const selectedFile = ref<File | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const submitError = ref<string | null>(null)
const reviewError = ref<string | null>(null)
const isEditModalOpen = ref(false)
const editTaskError = ref<string | null>(null)

const isAssignedEmployee = computed(
  () =>
    currentUser.value !== null &&
    hasUserRole(currentUser.value) &&
    currentUser.value.role === 'employee' &&
    currentTask.value?.assignedEmployeeId === currentUser.value.id,
)

const isTaskProjectLeader = computed(
  () =>
    currentUser.value !== null &&
    hasUserRole(currentUser.value) &&
    currentUser.value.role === 'projectLeader' &&
    currentProject.value?.projectLeaderId === currentUser.value.id,
)

const showApprovalCard = computed(
  () =>
    isTaskProjectLeader.value &&
    currentTask.value?.status === TASK_STATUS_PENDING_APPROVAL,
)

const canEditTask = computed(
  () =>
    isTaskProjectLeader.value &&
    currentTask.value?.status !== TASK_STATUS_APPROVED,
)

const assignedName = computed(() => {
  const employeeId = currentTask.value?.assignedEmployeeId
  if (!employeeId) return '—'
  return userNameById.value[employeeId] ?? 'Ukjent'
})

const createdByName = computed(() => {
  const creatorId = currentTask.value?.createdBy
  if (!creatorId) return '—'
  return userNameById.value[creatorId] ?? 'Ukjent'
})

const optionalStatusOptions = computed(() => [
  { value: 'not_started', label: taskStatusLabel('not_started') },
  { value: 'pending_approval', label: taskStatusLabel('pending_approval') },
])

const canSubmitUpdate = computed(
  () =>
    updateDraft.value.trim().length > 0 || selectedImage.value !== null || selectedFile.value !== null,
)

watch(
  taskId,
  (id) => {
    if (id) {
      tasksStore.subscribeTask(id)
      taskUpdatesStore.subscribeTaskUpdates(id)
    }
  },
  { immediate: true },
)

watch(
  () => currentTask.value?.projectId,
  (projectId) => {
    if (projectId) {
      projectsStore.subscribeProject(projectId)
    }
  },
  { immediate: true },
)

watch(
  () => {
    const authorIds = updates.value.map((update) => update.createdBy)
    const relatedIds = [
      currentProject.value?.projectLeaderId,
      currentTask.value?.assignedEmployeeId,
      currentTask.value?.createdBy,
    ]
    return [...new Set([...authorIds, ...relatedIds].filter(Boolean))] as string[]
  },
  (userIds) => {
    usersStore.syncLiveUserNameWatchers(userIds)
  },
  { immediate: true },
)

onUnmounted(() => {
  tasksStore.unsubscribeTaskListener()
  taskUpdatesStore.unsubscribeTaskUpdatesListener()
  projectsStore.unsubscribeProjectListener()
  usersStore.clearLiveUserNameWatchers()
})

async function changeStatus(status: TaskStatus) {
  if (!currentTask.value || !currentUser.value) return

  statusError.value = null
  try {
    await taskUpdatesStore.recordStatusChange({
      taskId: currentTask.value.id,
      projectId: currentTask.value.projectId,
      text: statusChangeLogText(currentTask.value.status, status),
      createdBy: currentUser.value.id,
      statusChange: status,
    })
  } catch {
    statusError.value = taskUpdatesStore.createError
  }
}

function openImagePicker() {
  imageInputRef.value?.click()
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function onImageSelected(event: Event) {
  const input = event.target as HTMLInputElement
  selectedImage.value = input.files?.[0] ?? null
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

function clearImage() {
  selectedImage.value = null
  if (imageInputRef.value) imageInputRef.value.value = ''
}

function clearFile() {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function resetUpdateForm() {
  updateDraft.value = ''
  optionalStatus.value = ''
  clearImage()
  clearFile()
  submitError.value = null
}

function updateStatusDescription(statusChange: TaskStatus | null) {
  if (!statusChange) return 'ingen status forandring'
  return `satte status til ${taskStatusLabel(statusChange)}`
}

async function submitUpdate() {
  if (!currentTask.value || !currentUser.value || !canSubmitUpdate.value) return

  submitError.value = null

  const statusChange = (optionalStatus.value || null) as TaskStatus | null

  try {
    await taskUpdatesStore.createUpdate({
      taskId: currentTask.value.id,
      projectId: currentTask.value.projectId,
      text: updateDraft.value,
      createdBy: currentUser.value.id,
      statusChange,
      imageFile: selectedImage.value,
      file: selectedFile.value,
    })
    resetUpdateForm()
  } catch {
    submitError.value = taskUpdatesStore.createError
  }
}

async function reviewTask(approved: boolean) {
  if (!currentTask.value || !currentUser.value) return

  reviewError.value = null
  try {
    await taskUpdatesStore.recordProjectLeaderReview({
      taskId: currentTask.value.id,
      projectId: currentTask.value.projectId,
      createdBy: currentUser.value.id,
      approved,
    })
  } catch {
    reviewError.value = taskUpdatesStore.createError
  }
}

function openEditModal() {
  editTaskError.value = null
  isEditModalOpen.value = true
}

async function handleSaveTask(payload: EditTaskPayload) {
  if (!currentTask.value) return

  editTaskError.value = null
  try {
    await tasksStore.updateTask(currentTask.value.id, currentTask.value.projectId, payload)
    isEditModalOpen.value = false
  } catch {
    editTaskError.value = tasksStore.updateError
  }
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col px-4 py-8 lg:px-10 lg:py-19">
    <p v-if="currentTaskLoading" class="text-sm text-gray-500">Laster oppgave…</p>
    <p v-else-if="currentTaskError" class="text-sm text-red-600">{{ currentTaskError }}</p>

    <template v-else-if="currentTask">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h1 class="max-w-5xl line-clamp-2 text-2xl font-semibold text-gray-900 lg:text-3xl">
          {{ currentTask.title }}
        </h1>
        <div v-if="canEditTask" class="flex w-full shrink-0 lg:w-auto">
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:w-auto"
            @click="openEditModal"
          >
            <Pencil :size="16" />
            <span>Rediger</span>
          </button>
        </div>
      </header>

      <section class="mt-8">
        <article
          v-if="showApprovalCard"
          class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div class="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0 space-y-1">
              <h2 class="text-sm font-semibold text-gray-900">Klar for godkjenning</h2>
              <p class="text-sm leading-relaxed text-gray-600">
                Denne oppgaven er merket som fullført av {{ assignedName }}. Gjennomgå arbeidet og
                godkjenn eller send tilbake.
              </p>
              <p v-if="reviewError" class="text-sm text-red-600">{{ reviewError }}</p>
            </div>

            <div class="flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                :disabled="creatingUpdate"
                @click="reviewTask(false)"
              >
                <X :size="16" />
                Send tilbake
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-md bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                :disabled="creatingUpdate"
                @click="reviewTask(true)"
              >
                <Check :size="16" />
                Godkjenn arbeid
              </button>
            </div>
          </div>
        </article>

        <section class="mt-6 grid gap-6 lg:grid-cols-3"> 
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
                    :disabled="creatingUpdate"
                    @click="changeStatus(TASK_STATUS_IN_PROGRESS)"
                  >
                    Begynn oppgave
                  </button>

                  <template v-else-if="currentTask.status === 'in_progress'">
                    <button
                      type="button"
                      class="min-w-0 flex-1 rounded-md bg-green-800 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60 sm:px-4 lg:flex-none lg:px-6"
                      :disabled="creatingUpdate"
                      @click="changeStatus(TASK_STATUS_PENDING_APPROVAL)"
                    >
                      Fullfør oppgave
                    </button>
                    <button
                      type="button"
                      class="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60 sm:px-4 lg:flex-none lg:px-6"
                      :disabled="creatingUpdate"
                      @click="changeStatus(TASK_STATUS_NOT_STARTED)"
                    >
                      Ta tilbake til ikke startet
                    </button>
                  </template>

                  <button
                    v-else-if="currentTask.status === 'pending_approval'"
                    type="button"
                    class="min-w-0 flex-1 rounded-md bg-green-800 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60 sm:px-4 lg:flex-none lg:px-6"
                    :disabled="creatingUpdate"
                    @click="changeStatus(TASK_STATUS_IN_PROGRESS)"
                  >
                    Fortsett arbeid
                  </button>
                </div>

                <p v-if="statusError || createError" class="mt-3 text-sm text-red-600">
                  {{ statusError || createError }}
                </p>
              </div>
            </article>

            <article class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div class="border-b border-gray-200 px-5 py-4">
                <h2 class="text-sm font-semibold text-gray-900">Oppdateringslogg</h2>
              </div>
              <div class="max-h-96 overflow-y-auto px-5 py-4">
                <p v-if="updatesLoading" class="text-sm text-gray-500">Laster oppdateringer…</p>
                <p v-else-if="updatesError" class="text-sm text-red-600">{{ updatesError }}</p>
                <p v-else-if="updates.length === 0" class="text-sm text-gray-500">
                  Ingen oppdateringer for øyeblikket.
                </p>
                <ul v-else class="space-y-3">
                  <li
                    v-for="update in updates"
                    :key="update.id"
                    class="overflow-hidden rounded-md border-l-4 py-3 pl-4 pr-4"
                    :class="taskUpdateCardClass(update.statusChange, update.text)"
                  >
                    <div class="flex flex-wrap items-center gap-2">
                      <UserAvatar :name="userNameById[update.createdBy] ?? 'Ukjent'" :scale="0.7" />
                      <p class="min-w-0 text-sm text-gray-900">
                        <span class="font-semibold">{{ userNameById[update.createdBy] ?? 'Ukjent' }}</span>
                        <span class="text-gray-400"> · </span>
                        <time class="text-gray-500">{{
                          formatRelativeTimeNorwegian(update.createdAt)
                        }}</time>
                        <span class="text-gray-400"> · </span>
                        <span :class="taskUpdateStatusTextClass(update.statusChange, update.text)">{{
                          updateStatusDescription(update.statusChange)
                        }}</span>
                      </p>
                    </div>

                    <p v-if="update.text" class="mt-2 text-sm leading-relaxed text-gray-800">
                      {{ update.text }}
                    </p>

                    <img
                      v-if="update.imageUrl"
                      :src="update.imageUrl"
                      alt="Vedlagt bilde"
                      class="mt-3 max-h-64 rounded-md border object-contain"
                      :class="taskUpdateAttachmentBorderClass(update.statusChange, update.text)"
                    />

                    <a
                      v-if="update.fileUrl"
                      :href="update.fileUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="mt-3 inline-flex items-center gap-2 text-sm font-medium"
                      :class="taskUpdateLinkClass(update.statusChange, update.text)"
                    >
                      <Paperclip :size="14" />
                      {{ update.fileName ?? 'Last ned fil' }}
                    </a>
                  </li>
                </ul>
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

                <input
                  ref="imageInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onImageSelected"
                />
                <input
                  ref="fileInputRef"
                  type="file"
                  class="hidden"
                  @change="onFileSelected"
                />

                <div
                  v-if="selectedImage || selectedFile"
                  class="flex flex-wrap gap-2"
                >
                  <span
                    v-if="selectedImage"
                    class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                  >
                    {{ selectedImage.name }}
                    <button type="button" class="text-gray-500 hover:text-gray-700" @click="clearImage">
                      <X :size="12" />
                    </button>
                  </span>
                  <span
                    v-if="selectedFile"
                    class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                  >
                    {{ selectedFile.name }}
                    <button type="button" class="text-gray-500 hover:text-gray-700" @click="clearFile">
                      <X :size="12" />
                    </button>
                  </span>
                </div>

                <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div class="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                      @click="openImagePicker"
                    >
                      <Camera :size="16" />
                      Bilde
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                      @click="openFilePicker"
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
                    class="inline-flex items-center justify-center gap-2 rounded-md bg-green-800 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60 lg:shrink-0"
                    :disabled="creatingUpdate || !canSubmitUpdate"
                    @click="submitUpdate"
                  >
                    <Send :size="16" />
                    {{ creatingUpdate ? 'Sender…' : 'Send oppdatering' }}
                  </button>
                </div>

                <p v-if="submitError || createError" class="text-sm text-red-600">
                  {{ submitError || createError }}
                </p>
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
                <dt class="text-sm text-gray-500">Opprettet av</dt>
                <dd class="text-sm font-medium text-gray-900">{{ createdByName }}</dd>
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
      </section>

      <EditTaskModal
        v-if="canEditTask"
        v-model="isEditModalOpen"
        :task="currentTask"
        :employees="employees"
        :employees-loading="usersLoading"
        :employees-error="usersError"
        :saving="updating"
        :error="editTaskError"
        @save="handleSaveTask"
      />
    </template>
  </div>
</template>
