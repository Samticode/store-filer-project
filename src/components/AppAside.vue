<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { LogOut } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

const authStore = useAuthStore()
const { currentUser, homeRouteName } = storeToRefs(authStore)
const route = useRoute()

const roleLabels: Record<UserRole, string> = {
  projectLeader: 'Prosjektleder',
  management: 'Ledelse',
  employee: 'Ansatt',
}

const navItems = computed(() => {
  if (!homeRouteName.value) return []
  return [
    {
      name: homeRouteName.value,
      label: 'Oversikt',
    },
  ]
})

function isActive(routeName: string) {
  return route.name === routeName
}
</script>

<template>
  <aside
    class="flex w-100 shrink-0 flex-col justify-between border-r border-gray-200 py-20 px-15 text-gray-900"
  >
    <div>
      <p class="text-xs font-medium uppercase tracking-widest text-green-900">Store Filer</p>
      <p class="mt-1 text-lg font-semibold leading-tight text-gray-900">Prosjektstyring</p>
    </div>
    <!-- 
    <nav class="flex-1 px-3 py-4">
      <ul class="space-y-1">
        <li v-for="item in navItems" :key="item.name">
          <RouterLink
            :to="{ name: item.name }"
            class="block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="
              isActive(item.name)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            "
          >
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
    -->
    <div class="">
      <div class="flex items-center justify-between gap-2 px-2">
        <UserAvatar v-if="currentUser" :name="currentUser.name" />
        <div class="min-w-0 flex-1">
          <p v-if="currentUser" class="truncate text-sm font-medium text-gray-900">
            {{ currentUser.name }}
          </p>
          <p v-if="currentUser" class="truncate text-xs text-gray-500">
            {{ roleLabels[currentUser.role] }}
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
    </div>
  </aside>
</template>
