<script setup lang="ts">
import { useId } from 'vue'

withDefaults(
  defineProps<{
    label?: string
    type?: string
    placeholder?: string
    disabled?: boolean
    autocomplete?: string
  }>(),
  {
    type: 'text',
    disabled: false,
  },
)

const model = defineModel<string>({ required: true })

const inputId = useId()
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      class="mb-1 block text-sm font-medium text-gray-700"
    >
      {{ label }}
    </label>
    <input
      :id="inputId"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700 disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
</template>
