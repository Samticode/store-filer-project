<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthSplitLayout from '@/components/AuthSplitLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await authStore.signup(name.value, email.value, password.value)
    if (authStore.homeRouteName) {
      await router.push({ name: authStore.homeRouteName })
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Registrering mislyktes'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthSplitLayout title="Registrer deg">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700" for="name">Navn</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          autocomplete="name"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>

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
          autocomplete="new-password"
          minlength="6"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded-lg bg-green-800 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
      >
        {{ submitting ? 'Registrerer…' : 'Registrer deg' }}
      </button>
    </form>

    <p class="text-center text-sm text-gray-500">
      Har du allerede en konto?
      <router-link to="/login" class="hover:underline">Logg inn</router-link>
    </p>
  </AuthSplitLayout>
</template>
