<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppInput from '@/components/AppInput.vue'
import AppModal from '@/components/AppModal.vue'
import AppSelect from '@/components/AppSelect.vue'
import type { AuthUser, TaskPriority, TaskStatus } from '@/types'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_MEDIUM,
  TASK_STATUSES,
  TASK_STATUS_NOT_STARTED,
} from '@/types'
import { taskPriorityLabel, taskStatusLabel } from '@/utils/taskLabels'

export type CreateTaskPayload = {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  assignedEmployeeId: string
}

const open = defineModel<boolean>({ required: true })

const props = defineProps<{
  employees: AuthUser[]
  employeesLoading?: boolean
  employeesError?: string | null
  saving?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  save: [payload: CreateTaskPayload]
}>()

const title = ref('')
const description = ref('')
const priority = ref<TaskPriority>(TASK_PRIORITY_MEDIUM)
const status = ref<TaskStatus>(TASK_STATUS_NOT_STARTED)
const assignedEmployeeId = ref('')
const validationError = ref<string | null>(null)

const priorityOptions = computed(() =>
  TASK_PRIORITIES.map((value) => ({
    value,
    label: taskPriorityLabel(value),
  })),
)

const statusOptions = computed(() =>
  TASK_STATUSES.map((value) => ({
    value,
    label: taskStatusLabel(value),
  })),
)

const employeeOptions = computed(() => {
  if (props.employeesLoading) {
    return [{ value: '', label: 'Laster ansatte…', disabled: true }]
  }
  if (props.employees.length === 0) {
    return [{ value: '', label: 'Ingen ansatte funnet', disabled: true }]
  }
  return [
    { value: '', label: 'Velg ansatt', disabled: true },
    ...props.employees.map((employee) => ({
      value: employee.id,
      label: employee.name,
    })),
  ]
})

const canSave = computed(
  () =>
    title.value.trim().length > 0 &&
    description.value.trim().length > 0 &&
    assignedEmployeeId.value !== '' &&
    props.employees.length > 0 &&
    !props.saving &&
    !props.employeesLoading,
)

watch(open, (isOpen) => {
  if (!isOpen) {
    title.value = ''
    description.value = ''
    priority.value = TASK_PRIORITY_MEDIUM
    status.value = TASK_STATUS_NOT_STARTED
    assignedEmployeeId.value = ''
    validationError.value = null
  }
})

function handleSave() {
  const trimmedTitle = title.value.trim()
  const trimmedDescription = description.value.trim()

  if (!trimmedTitle) {
    validationError.value = 'Oppgavetittel kan ikke være tom.'
    return
  }
  if (!trimmedDescription) {
    validationError.value = 'Beskrivelse kan ikke være tom.'
    return
  }
  if (!assignedEmployeeId.value) {
    validationError.value = 'Velg en ansatt.'
    return
  }

  validationError.value = null
  emit('save', {
    title: trimmedTitle,
    description: trimmedDescription,
    priority: priority.value,
    status: status.value,
    assignedEmployeeId: assignedEmployeeId.value,
  })
}
</script>

<template>
  <AppModal
    v-model="open"
    size="md"
    title="Legg til oppgave"
    description="Opprett en ny oppgave for dette prosjektet."
  >
    <form class="space-y-4" @submit.prevent="handleSave">
      <AppInput
        v-model="title"
        label="Tittel"
        placeholder="Navn på oppgaven"
        :disabled="saving"
      />

      <div class="w-full">
        <label for="task-description" class="mb-1 block text-sm font-medium text-gray-700">
          Beskrivelse
        </label>
        <textarea
          id="task-description"
          v-model="description"
          rows="4"
          placeholder="Beskriv oppgaven"
          :disabled="saving"
          class="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <AppSelect
          v-model="priority"
          label="Prioritet"
          :options="priorityOptions"
          :disabled="saving"
        />

        <AppSelect
          v-model="status"
          label="Status"
          :options="statusOptions"
          :disabled="saving"
        />
      </div>

      <AppSelect
        v-model="assignedEmployeeId"
        label="Tildelt ansatt"
        placeholder="Velg ansatt"
        :options="employeeOptions"
        :disabled="saving || employeesLoading || employees.length === 0"
      />

      <p v-if="employeesError" class="text-sm text-red-600">{{ employeesError }}</p>
      <p v-else-if="validationError" class="text-sm text-red-600">{{ validationError }}</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
    </form>

    <template #footer>
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        :disabled="saving"
        @click="open = false"
      >
        Avbryt
      </button>
      <button
        type="button"
        class="rounded-lg bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
        :disabled="!canSave"
        @click="handleSave"
      >
        {{ saving ? 'Oppretter…' : 'Opprett oppgave' }}
      </button>
    </template>
  </AppModal>
</template>
