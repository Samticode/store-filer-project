<script setup lang="ts">
import AppModal from '@/components/AppModal.vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
    error?: string | null
  }>(),
  {
    confirmLabel: 'Bekreft',
    cancelLabel: 'Avbryt',
    loading: false,
    error: null,
  },
)

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  confirm: []
}>()

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <AppModal v-model="open" size="md" :title="title" :description="description">
    <template #footer>
      <p v-if="error" class="mr-auto text-sm text-red-600">{{ error }}</p>
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60"
        :disabled="loading"
        @click="open = false"
      >
        {{ cancelLabel }}
      </button>
      <button
        type="button"
        class="rounded-lg bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
        :disabled="loading"
        @click="handleConfirm"
      >
        {{ loading ? 'Lagrer…' : confirmLabel }}
      </button>
    </template>
  </AppModal>
</template>
