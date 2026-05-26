<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthSplitLayout from '@/components/AuthSplitLayout.vue'
import PrivacyPolicyLink from '@/components/PrivacyPolicyLink.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await authStore.login(email.value, password.value)
    if (authStore.homeRouteName) {
      await router.push({ name: authStore.homeRouteName })
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Innlogging mislyktes'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthSplitLayout title="Logg inn">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700" for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700" for="password">Passord</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded-lg bg-green-800 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
      >
        {{ submitting ? 'Logger inn…' : 'Logg inn' }}
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mb-1">
      Har du ikke en konto?
      <router-link to="/signup" class="font-medium text-green-800 underline hover:text-green-700">
        Registrer deg
      </router-link>
    </p>
    <p class="text-center text-xs text-gray-500">
      <PrivacyPolicyLink label="Personvern og informasjon" variant="muted" />
    </p>
  </AuthSplitLayout>
</template>
