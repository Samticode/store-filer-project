<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppInput from '@/components/AppInput.vue'
import AppModal from '@/components/AppModal.vue'
import AppSelect from '@/components/AppSelect.vue'
import { USER_ROLES, type AuthUser, type UserRole } from '@/types'
import { PENDING_ROLE_LABEL, ROLE_LABELS } from '@/utils/roleLabels'

export type EditUserPayload = {
  name: string
  email: string
  role: UserRole
}

const open = defineModel<boolean>({ required: true })

const props = defineProps<{
  user: AuthUser | null
  saving?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  save: [payload: EditUserPayload]
}>()

const name = ref('')
const email = ref('')
const selectedRole = ref<UserRole | ''>('')
const validationError = ref<string | null>(null)

const roleOptions = computed(() => [
  { value: '', label: PENDING_ROLE_LABEL, disabled: true },
  ...USER_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] })),
])

const canSave = computed(
  () =>
    name.value.trim().length > 0 &&
    email.value.trim().length > 0 &&
    selectedRole.value !== '' &&
    !props.saving,
)

watch(
  () => props.user,
  (user) => {
    name.value = user?.name ?? ''
    email.value = user?.email ?? ''
    selectedRole.value = user?.role ?? ''
    validationError.value = null
  },
  { immediate: true },
)

function handleSave() {
  const trimmedName = name.value.trim()
  const trimmedEmail = email.value.trim()

  if (!trimmedName) {
    validationError.value = 'Navn kan ikke være tomt.'
    return
  }
  if (!trimmedEmail) {
    validationError.value = 'Email kan ikke være tom.'
    return
  }
  if (!selectedRole.value) {
    validationError.value = 'Velg en rolle.'
    return
  }

  validationError.value = null
  emit('save', { name: trimmedName, email: trimmedEmail, role: selectedRole.value })
}
</script>

<template>
  <AppModal
    v-model="open"
    size="md"
    title="Rediger bruker"
    description="Oppdater brukerens navn, email og rolle."
  >
    <form v-if="user" class="space-y-4" @submit.prevent="handleSave">
      <AppInput v-model="name" label="Navn" autocomplete="name" :disabled="saving" />

      <AppInput
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        :disabled="saving"
      />

      <AppSelect
        v-model="selectedRole"
        label="Rolle"
        :placeholder="PENDING_ROLE_LABEL"
        :options="roleOptions"
        :disabled="saving"
      />

      <p v-if="validationError" class="text-sm text-red-600">{{ validationError }}</p>
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
