<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { usePendingApprovalTasksStore } from '@/stores/pendingApprovalTasks'
import { useProjectsStore } from '@/stores/projects'
import { hasUserRole } from '@/types'
import { taskRouteForTask } from '@/utils/roleRoutes'
import { taskStatusLabel } from '@/utils/taskLabels'

const emit = defineEmits<{
  navigate: []
}>()

const PANEL_WIDTH = 320
const VIEWPORT_PADDING = 16
const PANEL_GAP = 8

const router = useRouter()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const pendingApprovalTasksStore = usePendingApprovalTasksStore()
const { currentUser } = storeToRefs(authStore)
const { projects } = storeToRefs(projectsStore)
const { tasks, count, loading, error } = storeToRefs(pendingApprovalTasksStore)

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref({
  top: '0px',
  left: '0px',
  width: `${PANEL_WIDTH}px`,
})

const projectNameById = computed(() =>
  Object.fromEntries(projects.value.map((project) => [project.id, project.name])),
)

watch(
  () => currentUser.value,
  (user) => {
    if (user && hasUserRole(user) && user.role === 'projectLeader') {
      projectsStore.subscribeLeaderProjects(user.id)
      return
    }

    projectsStore.unsubscribeProjectsListener()
    pendingApprovalTasksStore.unsubscribe()
  },
  { immediate: true },
)

watch(
  () => projects.value.map((project) => project.id),
  (projectIds) => {
    if (
      currentUser.value &&
      hasUserRole(currentUser.value) &&
      currentUser.value.role === 'projectLeader'
    ) {
      pendingApprovalTasksStore.syncForProjects(projectIds)
    }
  },
  { immediate: true },
)

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function updatePanelPosition() {
  if (!buttonRef.value) return

  const rect = buttonRef.value.getBoundingClientRect()
  const panelWidth = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2)
  const panelHeight = panelRef.value?.offsetHeight ?? 0

  let left = rect.right - panelWidth
  left = clamp(left, VIEWPORT_PADDING, window.innerWidth - panelWidth - VIEWPORT_PADDING)

  const spaceAbove = rect.top - VIEWPORT_PADDING
  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING
  const openAbove = spaceAbove >= panelHeight + PANEL_GAP || spaceAbove >= spaceBelow

  let top = openAbove ? rect.top - PANEL_GAP - panelHeight : rect.bottom + PANEL_GAP
  top = clamp(top, VIEWPORT_PADDING, window.innerHeight - panelHeight - VIEWPORT_PADDING)

  panelStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${panelWidth}px`,
  }
}

function onDocumentClick(event: MouseEvent) {
  if (!isOpen.value) return
  const target = event.target
  if (target instanceof Node && rootRef.value?.contains(target)) return
  if (target instanceof Node && panelRef.value?.contains(target)) return
  isOpen.value = false
}

watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    updatePanelPosition()
    requestAnimationFrame(() => updatePanelPosition())
    document.addEventListener('click', onDocumentClick)
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)
    return
  }

  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', updatePanelPosition)
  window.removeEventListener('scroll', updatePanelPosition, true)
})

watch([tasks, loading, error], async () => {
  if (!isOpen.value) return
  await nextTick()
  updatePanelPosition()
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', updatePanelPosition)
  window.removeEventListener('scroll', updatePanelPosition, true)
})

function togglePanel() {
  isOpen.value = !isOpen.value
}

async function openTask(taskId: string, projectId: string) {
  const route = taskRouteForTask(currentUser.value, { id: taskId, projectId })
  if (!route) return

  isOpen.value = false
  emit('navigate')
  await router.push(route)
}
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      ref="buttonRef"
      type="button"
      class="relative flex shrink-0 items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      aria-label="Oppgaver til godkjenning"
      @click.stop="togglePanel"
    >
      <Bell :size="16" />
      <span
        v-if="count > 0"
        class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-semibold leading-none text-white"
      >
        {{ count > 9 ? '9+' : count }}
      </span>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isOpen"
          ref="panelRef"
          role="dialog"
          aria-label="Oppgaver til godkjenning"
          class="fixed z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          :style="panelStyle"
          @click.stop
        >
          <div class="border-b border-gray-200 px-4 py-3">
            <h2 class="text-sm font-semibold text-gray-900">Til godkjenning</h2>
            <p class="mt-0.5 text-xs text-gray-500">Oppgaver som venter på din godkjenning</p>
          </div>

          <div class="max-h-80 overflow-y-auto">
            <p v-if="loading" class="px-4 py-6 text-sm text-gray-500">Laster…</p>
            <p v-else-if="error" class="px-4 py-6 text-sm text-red-600">{{ error }}</p>
            <p v-else-if="tasks.length === 0" class="px-4 py-6 text-sm text-gray-500">
              Ingen oppgaver venter på godkjenning.
            </p>
            <ul v-else class="divide-y divide-gray-100">
              <li v-for="task in tasks" :key="task.id">
                <button
                  type="button"
                  class="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  @click="openTask(task.id, task.projectId)"
                >
                  <span class="text-sm font-medium text-gray-900 line-clamp-2">{{ task.title }}</span>
                  <span class="text-xs text-gray-500">
                    {{ projectNameById[task.projectId] ?? 'Ukjent prosjekt' }}
                  </span>
                  <span class="text-xs font-medium text-amber-800">
                    {{ taskStatusLabel('pending_approval') }}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
