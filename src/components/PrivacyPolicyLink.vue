<script setup lang="ts">
import { usePrivacyModalStore } from '@/stores/privacyModal'

withDefaults(
  defineProps<{
    label?: string
    variant?: 'green' | 'muted' | 'blue'
  }>(),
  {
    label: 'personvernerklæringen',
    variant: 'green',
  },
)

const privacyModal = usePrivacyModalStore()

const variantClasses: Record<'green' | 'muted' | 'blue', string> = {
  green: 'font-medium text-green-800 underline hover:text-green-700',
  muted: 'underline hover:text-gray-700',
  blue: 'font-medium underline hover:text-blue-950',
}

function open(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  privacyModal.show()
}
</script>

<template>
  <button
    type="button"
    :class="variantClasses[variant]"
    @click="open"
  >
    {{ label }}
  </button>
</template>
