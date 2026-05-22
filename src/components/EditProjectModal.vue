<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppInput from '@/components/AppInput.vue'
import AppModal from '@/components/AppModal.vue'
import AppSelect from '@/components/AppSelect.vue'
import type { AuthUser, Project, ProjectStatus } from '@/types'
import { editProjectStatusOptions } from '@/utils/projectLabels'

export type EditProjectPayload = {
  name: string
  description: string
  projectLeaderId: string
  status: ProjectStatus
}

const open = defineModel<boolean>({ required: true })

const props = defineProps<{
  project: Project | null
  projectLeaders: AuthUser[]
  leadersLoading?: boolean
  leadersError?: string | null
  saving?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  save: [payload: EditProjectPayload]
}>()

const name = ref('')
const description = ref('')
const projectLeaderId = ref('')
const status = ref<ProjectStatus>('active')
const validationError = ref<string | null>(null)

const statusOptions = computed(() => editProjectStatusOptions(props.project?.status))

const projectLeaderOptions = computed(() => {
  if (props.leadersLoading) {
    return [{ value: '', label: 'Laster prosjektledere…', disabled: true }]
  }
  if (props.projectLeaders.length === 0) {
    return [{ value: '', label: 'Ingen prosjektledere funnet', disabled: true }]
  }
  return [
    { value: '', label: 'Velg prosjektleder', disabled: true },
    ...props.projectLeaders.map((leader) => ({
      value: leader.id,
      label: leader.name,
    })),
  ]
})

const canSave = computed(
  () =>
    name.value.trim().length > 0 &&
    description.value.trim().length > 0 &&
    projectLeaderId.value !== '' &&
    props.projectLeaders.length > 0 &&
    !props.saving &&
    !props.leadersLoading,
)

watch(
  () => props.project,
  (project) => {
    name.value = project?.name ?? ''
    description.value = project?.description ?? ''
    projectLeaderId.value = project?.projectLeaderId ?? ''
    status.value = project?.status ?? 'active'
    validationError.value = null
  },
  { immediate: true },
)

watch(open, (isOpen) => {
  if (!isOpen) validationError.value = null
})

function handleSave() {
  const trimmedName = name.value.trim()
  const trimmedDescription = description.value.trim()

  if (!trimmedName) {
    validationError.value = 'Prosjektnavn kan ikke være tomt.'
    return
  }
  if (!trimmedDescription) {
    validationError.value = 'Beskrivelse kan ikke være tom.'
    return
  }
  if (!projectLeaderId.value) {
    validationError.value = 'Velg en prosjektleder.'
    return
  }

  validationError.value = null
  emit('save', {
    name: trimmedName,
    description: trimmedDescription,
    projectLeaderId: projectLeaderId.value,
    status: status.value,
  })
}
</script>

<template>
  <AppModal
    v-model="open"
    size="md"
    title="Rediger prosjekt"
    description="Oppdater prosjektets navn, beskrivelse, prosjektleder og status."
  >
    <form v-if="project" class="space-y-4" @submit.prevent="handleSave">
      <AppInput
        v-model="name"
        label="Prosjektnavn"
        placeholder="Navn på prosjektet"
        :disabled="saving"
      />

      <div class="w-full">
        <label for="edit-project-description" class="mb-1 block text-sm font-medium text-gray-700">
          Beskrivelse
        </label>
        <textarea
          id="edit-project-description"
          v-model="description"
          rows="4"
          placeholder="Beskriv prosjektet"
          :disabled="saving"
          class="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <AppSelect
        v-model="projectLeaderId"
        label="Prosjektleder"
        placeholder="Velg prosjektleder"
        :options="projectLeaderOptions"
        :disabled="saving || leadersLoading || projectLeaders.length === 0"
      />

      <AppSelect
        v-model="status"
        label="Status"
        placeholder="Velg status"
        :options="statusOptions"
        :disabled="saving"
      />

      <p v-if="leadersError" class="text-sm text-red-600">{{ leadersError }}</p>
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
        {{ saving ? 'Lagrer…' : 'Lagre' }}
      </button>
    </template>
  </AppModal>
</template>
