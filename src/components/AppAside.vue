<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ChevronRight, ClipboardList, LogOut, Users, FolderKanban } from '@lucide/vue'
import type { Component } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'
import PendingApprovalBell from '@/components/PendingApprovalBell.vue'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'
import { hasUserRole } from '@/types'
import { roleLabel } from '@/utils/roleLabels'

const emit = defineEmits<{
  navigate: []
}>()

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)
const route = useRoute()

type NavItem = {
  name: string
  label: string
  icon: Component
  roles?: UserRole[]
}

const allNavItems: NavItem[] = [
  { name: 'employee', label: 'Dine oppgaver', icon: ClipboardList, roles: ['employee'] },
  { name: 'project-leader', label: 'Mine prosjekter', icon: FolderKanban, roles: ['projectLeader'] },
  { name: 'management', label: 'Prosjekter', icon: FolderKanban, roles: ['management'] },
  { name: 'tilganger', label: 'Tilganger', icon: Users, roles: ['management'] },
]

const navItems = computed(() =>
  allNavItems.filter(
    (item) =>
      !item.roles ||
      (currentUser.value !== null &&
        hasUserRole(currentUser.value) &&
        item.roles.includes(currentUser.value.role)),
  ),
)

const showApprovalBell = computed(
  () =>
    currentUser.value !== null &&
    hasUserRole(currentUser.value) &&
    currentUser.value.role === 'projectLeader',
)

function isActive(name: string) {
  if (name === 'management') {
    return (
      route.name === 'management' ||
      route.name === 'management-project' ||
      route.name === 'management-task'
    )
  }
  if (name === 'project-leader') {
    return (
      route.name === 'project-leader' ||
      route.name === 'project-leader-project' ||
      route.name === 'project-leader-task'
    )
  }
  if (name === 'employee') {
    return route.name === 'employee' || route.name === 'employee-task'
  }
  return route.name === name
}

function onNavigate() {
  emit('navigate')
}
</script>

<template>
  <aside
    class="flex w-full shrink-0 flex-col justify-between gap-16 border-r border-gray-200 bg-white py-8 text-gray-900 lg:w-100 lg:gap-24 lg:py-20"
  >
    <div class="px-6 lg:px-15">
      <p class="text-xs font-medium uppercase tracking-widest text-green-900">Store Filer AS</p>
      <p class="text-xl font-semibold leading-tight text-gray-900">Prosjektstyring</p>
    </div>

    <nav class="flex-1">
      <ul class="flex flex-col gap-2 px-4 lg:gap-5 lg:px-10">
        <li v-for="item in navItems" :key="item.name" class="flex items-center">
          <span
            class="flex shrink-0 items-center justify-center overflow-hidden transition-[width,opacity] duration-200 ease-out"
            :class="isActive(item.name) ? 'w-5 opacity-100' : 'w-0 opacity-0'"
            aria-hidden="true"
          >
            <ChevronRight :size="16" class="text-gray-900" />
          </span>
          <RouterLink
            :to="{ name: item.name }"
            class="flex flex-1 items-center rounded-lg py-2 px-4 text-sm text-gray-900 transition-[font-weight] duration-200 ease-out lg:px-5"
            :class="isActive(item.name) ? 'font-semibold' : 'font-medium'"
            @click="onNavigate"
          >
            <span class="flex w-full items-center gap-4 lg:gap-6">
              <component :is="item.icon" :size="20" class="shrink-0" />
              <span>{{ item.label }}</span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="flex items-center justify-between gap-2 px-6 lg:px-17">
      <UserAvatar v-if="currentUser" :name="currentUser.name" />
      <div class="min-w-0 flex-1">
        <p v-if="currentUser" class="truncate text-sm font-medium text-gray-900">
          {{ currentUser.name }}
        </p>
        <p v-if="currentUser" class="truncate text-xs text-gray-500">
          {{ roleLabel(currentUser.role) }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <PendingApprovalBell v-if="showApprovalBell" @navigate="onNavigate" />
        <button
          type="button"
          class="flex shrink-0 items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="Logg ut"
          @click="authStore.logout"
        >
          <LogOut :size="16" />
        </button>
      </div>
    </div>
  </aside>
</template>
