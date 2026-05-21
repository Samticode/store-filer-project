<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Menu } from '@lucide/vue'
import AppAside from '@/components/AppAside.vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'

const route = useRoute()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const { isAuthenticated } = storeToRefs(authStore)
const isMobileNavOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    isMobileNavOpen.value = false
  },
)

watch(isMobileNavOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

watch(
  isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      usersStore.subscribeUsers()
      return
    }

    usersStore.resetListeners()
  },
  { immediate: true },
)

function closeMobileNav() {
  isMobileNavOpen.value = false
}
</script>

<template>
  <div class="flex min-h-dvh bg-gray-50">
    <AppAside class="hidden shrink-0 self-stretch lg:flex" />

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
          v-if="isMobileNavOpen"
          class="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigasjonsmeny"
        >
          <div class="fixed inset-0 bg-black/40" aria-hidden="true" @click="closeMobileNav" />
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="-translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-x-0"
            leave-to-class="-translate-x-full"
          >
            <AppAside
              v-if="isMobileNavOpen"
              class="fixed inset-y-0 left-0 z-10 flex w-72 max-w-[85vw] shadow-xl"
              @navigate="closeMobileNav"
            />
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <div class="flex min-h-dvh min-w-0 flex-1 flex-col">
      <header
        class="sticky top-0 z-40 flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden"
      >
        <button
          type="button"
          class="flex shrink-0 items-center justify-center rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
          aria-label="Åpne meny"
          @click="isMobileNavOpen = true"
        >
          <Menu :size="22" />
        </button>
        <div class="min-w-0">
          <p class="text-xs font-medium uppercase tracking-widest text-green-900">Store Filer AS</p>
          <p class="truncate text-sm font-semibold text-gray-900">Prosjektstyring</p>
        </div>
      </header>

      <main class="flex min-h-0 flex-1 flex-col">
        <RouterView />
      </main>
    </div>
  </div>
</template>
