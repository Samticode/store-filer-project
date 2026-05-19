<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { LogOut, Users } from '@lucide/vue'
import type { Component } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'
import { hasUserRole } from '@/types'
import { roleLabel } from '@/utils/roleLabels'

const authStore = useAuthStore()
const { currentUser, homeRouteName } = storeToRefs(authStore)
const route = useRoute()

type NavItem = {
  name: string
  label: string
  icon: Component
  roles?: UserRole[]
}

const allNavItems: NavItem[] = [
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

function isActive(name: string) {
  return route.name === name
}
</script>

<template>
  <aside
    class="flex w-100 shrink-0 flex-col justify-between border-r border-gray-200 py-20 text-gray-900 gap-12"
  >
    <div class="px-15">
      <p class="text-xs font-medium uppercase tracking-widest text-green-900">Store Filer</p>
      <p class="text-xl font-semibold leading-tight text-gray-900">Prosjektstyring</p>
    </div>

    <nav class="flex-1">
      <ul class="px-10">
        <li v-for="item in navItems" :key="item.name">
          <RouterLink
            :to="{ name: item.name }"
            class="flex items-center gap-2 rounded-lg py-2 px-5 text-sm font-medium transition-colors"
            :class="isActive(item.name) ? 'bg-gray-100 text-gray-900' : 'text-gray-900 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="flex items-center gap-2 w-full">
              <component :is="item.icon" :size="20" class="shrink-0" />
              <span class="flex items-center">{{ item.label }}</span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="flex items-center justify-between gap-2 px-17">
      <UserAvatar v-if="currentUser" :name="currentUser.name" />
      <div class="min-w-0 flex-1">
        <p v-if="currentUser" class="truncate text-sm font-medium text-gray-900">
          {{ currentUser.name }}
        </p>
        <p v-if="currentUser" class="truncate text-xs text-gray-500">
          {{ roleLabel(currentUser.role) }}
        </p>
      </div>
      <button
        type="button"
        class="flex shrink-0 items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label="Logg ut"
        @click="authStore.logout"
      >
        <LogOut :size="16" />
      </button>
    </div>
  </aside>
</template>
