<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { X } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    size?: 'md' | 'lg' | 'xl' | '2xl'
  }>(),
  { size: 'xl' },
)

const sizeClasses: Record<typeof props.size, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  close: []
}>()

function close() {
  open.value = false
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    close()
  }
}

watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <div class="fixed inset-0 bg-black/40" aria-hidden="true" @click="close" />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          :aria-describedby="props.description ? 'modal-description' : undefined"
          class="relative z-10 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
          :class="sizeClasses[size]"
          @click.stop
        >
          <div
            class="flex items-start justify-between gap-4 px-4 py-4"
            :class="{ 'border-b border-gray-200': $slots.default }"
          >
            <div class="min-w-0">
              <h2 id="modal-title" class="text-lg font-semibold text-gray-900">
                {{ title }}
              </h2>
              <p v-if="description" id="modal-description" class=" text-sm text-gray-500">
                {{ description }}
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Lukk"
              @click="close"
            >
              <X :size="18" />
            </button>
          </div>

          <div v-if="$slots.default" class="px-4 py-5">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 border-t border-gray-200 px-4 py-4"
            :class="{ 'bg-gray-50': $slots.default }"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
