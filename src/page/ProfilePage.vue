<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppInput from '@/components/AppInput.vue'
import DataRegistrationNotice from '@/components/DataRegistrationNotice.vue'
import PrivacyPolicyLink from '@/components/PrivacyPolicyLink.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import { roleBadgeClass, roleLabel } from '@/utils/roleLabels'

const authStore = useAuthStore()
const { currentUser, updatingProfile, profileUpdateError } = storeToRefs(authStore)

const name = ref('')
const email = ref('')
const successMessage = ref<string | null>(null)
const validationError = ref<string | null>(null)

watch(
  currentUser,
  (user) => {
    name.value = user?.name ?? ''
    email.value = user?.email ?? ''
    successMessage.value = null
    validationError.value = null
  },
  { immediate: true },
)

async function handleSave() {
  if (!currentUser.value) return

  successMessage.value = null
  validationError.value = null

  const trimmedName = name.value.trim()
  const trimmedEmail = email.value.trim()

  if (!trimmedName) {
    validationError.value = 'Navn kan ikke være tomt.'
    return
  }

  if (!trimmedEmail) {
    validationError.value = 'Email kan ikke være tom.'
    return
  }

  const unchanged =
    trimmedName === currentUser.value.name && trimmedEmail === currentUser.value.email

  if (unchanged) {
    validationError.value = 'Ingen endringer å lagre.'
    return
  }

  try {
    await authStore.updateProfile({ name: trimmedName, email: trimmedEmail })
    successMessage.value = 'Profilen er oppdatert.'
  } catch {
    validationError.value = authStore.profileUpdateError
  }
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col px-4 py-8 lg:px-10 lg:py-19">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold text-gray-900 lg:text-3xl">Profil</h1>
      <p class="text-sm text-gray-500">Oppdater navn og email for kontoen din.</p>
    </header> 

    <section v-if="currentUser" class="mt-8 max-w-xl space-y-6">
      <DataRegistrationNotice />

      <article class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 px-5 py-4">
          <div class="flex items-center gap-3">
            <UserAvatar :name="currentUser.name" />
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-gray-900">{{ currentUser.name }}</p>
              <span
                class="mt-1 inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium"
                :class="roleBadgeClass(currentUser.role)"
              >
                {{ roleLabel(currentUser.role) }}
              </span>
            </div>
          </div>
        </div>

        <form class="space-y-4 px-5 py-4" @submit.prevent="handleSave">
          <AppInput
            v-model="name"
            label="Navn"
            autocomplete="name"
            :disabled="updatingProfile"
          />
          <AppInput
            v-model="email"
            label="Email"
            type="email"
            autocomplete="email"
            :disabled="updatingProfile"
          />

          <p v-if="successMessage" class="text-sm text-green-700">{{ successMessage }}</p>
          <p v-else-if="validationError || profileUpdateError" class="text-sm text-red-600">
            {{ validationError || profileUpdateError }}
          </p>

          <div class="flex justify-end pt-2">
            <button
              type="submit"
              class="rounded-md bg-green-800 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
              :disabled="updatingProfile"
            >
              {{ updatingProfile ? 'Lagrer…' : 'Lagre endringer' }}
            </button>
          </div>
        </form>
      </article>
    </section>
  </div>
</template>
