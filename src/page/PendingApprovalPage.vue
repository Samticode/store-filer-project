<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Clock } from '@lucide/vue'
import AuthSplitLayout from '@/components/AuthSplitLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { PENDING_APPROVAL_ROUTE_NAME } from '@/utils/roleRoutes'

const router = useRouter()
const authStore = useAuthStore()

let stopWatchingProfile: (() => void) | null = null

onMounted(() => {
  stopWatchingProfile = authStore.watchProfile()
})

onUnmounted(() => {
  stopWatchingProfile?.()
})

watch(
  () => authStore.homeRouteName,
  (routeName) => {
    if (routeName && routeName !== PENDING_APPROVAL_ROUTE_NAME) {
      router.push({ name: routeName })
    }
  },
)
</script>

<template>
  <AuthSplitLayout title="Venter på godkjenning">
    <div class="space-y-5">
      <div
        class="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4"
      >
        <div class="flex gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"
          >
            <Clock :size="20" :stroke-width="2" />
          </div>
          <div class="min-w-0 space-y-1">
            <p class="text-sm font-medium text-gray-900">Tilgang ikke aktivert ennå</p>
            <p class="text-sm leading-relaxed text-gray-600">
              Kontoen din er opprettet, men du har ikke fått tilgang ennå. En leder må tildele deg
              en rolle før du kan bruke appen.
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="authStore.currentUser"
        class="rounded-lg border border-gray-200 bg-white px-4 py-3"
      >
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Innlogget som</p>
        <p class="mt-0.5 truncate text-sm font-medium text-gray-900">
          {{ authStore.currentUser.email }}
        </p>
      </div>

      <p class="text-center text-xs leading-relaxed text-gray-400">
        Du blir automatisk videresendt når en leder har godkjent deg.
      </p>

      <div class="border-t border-gray-200 pt-5">
        <button
          type="button"
          class="w-full rounded-lg bg-green-800 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
          @click="authStore.logout"
        >
          Logg ut
        </button>
      </div>
    </div>
  </AuthSplitLayout>
</template>
