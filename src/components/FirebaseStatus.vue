<script setup lang="ts">
import { computed } from 'vue'
import { useFirebaseApp } from 'vuefire'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const firebaseApp = useFirebaseApp()
const authStore = useAuthStore()
const { currentUser, isAuthenticated, loading } = storeToRefs(authStore)

const projectId = computed(() => firebaseApp.options.projectId ?? '—')

const authStatus = computed(() => {
  if (loading.value) return 'Loading…'
  if (isAuthenticated.value) return 'Signed in'
  return 'Signed out'
})

const authStatusClass = computed(() => {
  if (loading.value) return 'text-amber-400'
  if (isAuthenticated.value) return 'text-emerald-400'
  return 'text-slate-400'
})
</script>

<template>
  <aside
    class="pointer-events-none fixed bottom-4 right-4 z-9999 max-w-xs rounded-lg border border-slate-700/80 bg-slate-900/95 px-3 py-2 font-mono text-xs text-slate-200 shadow-lg backdrop-blur-sm"
  >
    <p class="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      Firebase
    </p>
    <dl class="space-y-1">
      <div class="flex justify-between gap-4">
        <dt class="text-slate-500">Project</dt>
        <dd class="truncate text-right">{{ projectId }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-slate-500">Auth</dt>
        <dd :class="authStatusClass">{{ authStatus }}</dd>
      </div>
      <template v-if="currentUser">
        <div class="flex justify-between gap-4">
          <dt class="text-slate-500">User</dt>
          <dd class="truncate text-right">{{ currentUser.name }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-slate-500">Role</dt>
          <dd class="text-right">{{ currentUser.role }}</dd>
        </div>
      </template>
    </dl>
  </aside>
</template>
