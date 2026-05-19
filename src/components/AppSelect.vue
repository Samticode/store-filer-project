<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useId, watch } from 'vue'
import { Check, ChevronDown } from '@lucide/vue'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    options: SelectOption[]
    disabled?: boolean
  }>(),
  {
    placeholder: 'Velg…',
    disabled: false,
  },
)

const model = defineModel<string>({ default: '' })

const selectId = useId()
const isOpen = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)
const highlightedIndex = ref(-1)

const dropdownStyle = ref({
  top: '0px',
  left: '0px',
  width: '0px',
})

const selectedOption = computed(() => props.options.find((option) => option.value === model.value))

const selectableOptions = computed(() => props.options.filter((option) => !option.disabled))

const displayLabel = computed(() => selectedOption.value?.label ?? props.placeholder)

const hasValue = computed(() => model.value !== '' && selectedOption.value != null)

function updateDropdownPosition() {
  const trigger = triggerRef.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

function openDropdown() {
  if (props.disabled) return
  isOpen.value = true
  highlightedIndex.value = selectableOptions.value.findIndex((option) => option.value === model.value)
  nextTick(updateDropdownPosition)
}

function closeDropdown() {
  isOpen.value = false
  highlightedIndex.value = -1
}

function toggleDropdown() {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function selectOption(value: string) {
  const option = props.options.find((item) => item.value === value)
  if (!option || option.disabled) return
  model.value = value
  closeDropdown()
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  if (triggerRef.value?.contains(target)) return
  if ((target as Element).closest('[data-app-select-dropdown]')) return
  closeDropdown()
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (!isOpen.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeDropdown()
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const next = highlightedIndex.value + 1
    highlightedIndex.value = next >= selectableOptions.value.length ? 0 : next
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    const prev = highlightedIndex.value - 1
    highlightedIndex.value = prev < 0 ? selectableOptions.value.length - 1 : prev
    return
  }

  if (event.key === 'Enter' && highlightedIndex.value >= 0) {
    event.preventDefault()
    const option = selectableOptions.value[highlightedIndex.value]
    if (option) selectOption(option.value)
  }
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onDocumentKeydown)
    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)
  } else {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onDocumentKeydown)
    window.removeEventListener('resize', updateDropdownPosition)
    window.removeEventListener('scroll', updateDropdownPosition, true)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
})
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="selectId"
      class="mb-1 block text-sm font-medium text-gray-700"
    >
      {{ label }}
    </label>

    <button
      :id="selectId"
      ref="triggerRef"
      type="button"
      role="combobox"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-controls="`${selectId}-listbox`"
      :disabled="disabled"
      class="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      :class="hasValue ? 'text-gray-900' : 'text-gray-400'"
      @click="toggleDropdown"
      @keydown.down.prevent="openDropdown"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
    >
      <span class="truncate">{{ displayLabel }}</span>
      <ChevronDown
        :size="16"
        class="shrink-0 text-gray-500 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <ul
          v-if="isOpen"
          :id="`${selectId}-listbox`"
          data-app-select-dropdown
          role="listbox"
          :aria-labelledby="selectId"
          class="fixed z-60 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          :style="dropdownStyle"
        >
          <li
            v-for="(option, index) in options"
            :key="option.value"
            role="option"
            :aria-selected="model === option.value"
            :aria-disabled="option.disabled || undefined"
            class="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm transition-colors"
            :class="[
              option.disabled
                ? 'cursor-not-allowed text-gray-400'
                : 'text-gray-900 hover:bg-gray-50',
              model === option.value && !option.disabled ? 'bg-green-50 text-green-900' : '',
              highlightedIndex === selectableOptions.findIndex((item) => item.value === option.value) &&
              !option.disabled
                ? 'bg-gray-100'
                : '',
            ]"
            @click="selectOption(option.value)"
            @mouseenter="
              !option.disabled &&
              (highlightedIndex = selectableOptions.findIndex((item) => item.value === option.value))
            "
          >
            <span class="truncate">{{ option.label }}</span>
            <Check
              v-if="model === option.value && !option.disabled"
              :size="16"
              class="shrink-0 text-green-800"
            />
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>
