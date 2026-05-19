<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left: brand panel -->
    <div
      class="relative hidden flex-2 overflow-hidden bg-green-800 lg:flex"
    >
      <div class="relative flex flex-col justify-end p-12 xl:p-16">
        <p class="text-sm font-medium uppercase tracking-widest text-violet-200/80">Store Filer</p>
        <h2 class="mt-1 max-w-md text-3xl font-semibold leading-tight text-white xl:text-4xl">
          Rollebasert prosjektstyring for hele teamet
        </h2>
      </div>
    </div>

    <!-- Right: login form -->
    <div
      class="flex w-full flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-12 sm:px-10 lg:max-w-md lg:flex-none lg:shrink-0 xl:max-w-lg"
    >
      <div class="w-full max-w-sm space-y-6">
        <h1 class="text-2xl font-semibold text-gray-800">Logg Inn</h1>

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
            <label class="mb-1 block text-sm font-medium text-gray-700" for="password"
              >Passord</label
            >
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

        <p class="text-center text-sm text-gray-500">
          Har du ikke en konto?
          <router-link to="/signup" class="hover:underline">Registrer deg</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
