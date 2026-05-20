<script setup lang="ts">
import { computed } from 'vue'

const BASE_SIZE_PX = 40
const BASE_FONT_SIZE_PX = 14

const props = withDefaults(
  defineProps<{
    name: string
    scale?: number
  }>(),
  { scale: 1 },
)

const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0]![0]!.toUpperCase()
  return `${words[0]![0]}${words[words.length - 1]![0]}`.toUpperCase()
})

const sizePx = computed(() => BASE_SIZE_PX * props.scale)

const avatarStyle = computed(() => {
  const size = sizePx.value
  return {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${BASE_FONT_SIZE_PX * props.scale}px`,
  }
})
</script>

<template>
  <div
    class="inline-flex shrink-0 items-center justify-center rounded-full bg-green-900 font-semibold leading-none text-white"
    :style="avatarStyle"
    :aria-label="name"
  >
    {{ initials }}
  </div>
</template>
