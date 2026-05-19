<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
}>()

const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0]![0]!.toUpperCase()
  return `${words[0]![0]}${words[words.length - 1]![0]}`.toUpperCase()
})
</script>

<template>
  <div
    class="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-900 text-sm font-semibold text-white"
    :aria-label="name"
  >
    {{ initials }}
  </div>
</template>
