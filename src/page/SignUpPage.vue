<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthSplitLayout from '@/components/AuthSplitLayout.vue'
import PrivacyPolicyLink from '@/components/PrivacyPolicyLink.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const acceptedPrivacy = ref(false)
const error = ref('')
const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  if (!acceptedPrivacy.value) {
    error.value = 'Du må godta personvernerklæringen for å registrere deg.'
    return
  }
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

      <div class="flex items-start gap-2">
        <input
          id="accept-privacy"
          v-model="acceptedPrivacy"
          type="checkbox"
          required
          class="mt-1 h-4 w-4 rounded border-gray-300 text-green-800 focus:ring-2 focus:ring-green-700"
        />
        <label for="accept-privacy" class="text-sm leading-relaxed text-gray-700">
          Jeg har lest og godtar
          <PrivacyPolicyLink />
          , inkludert informasjon om registrering av arbeidsaktivitet.
        </label>
      </div>

      <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

      <button
        type="submit"
        :disabled="submitting || !acceptedPrivacy || !name || !email || !password"
        class="w-full rounded-lg bg-green-800 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
      >
        {{ submitting ? 'Registrerer…' : 'Registrer deg' }}
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mb-1">
      Har du allerede en konto?
      <router-link to="/login" class="font-medium text-green-800 underline hover:text-green-700">
        Logg inn
      </router-link>
    </p>
    <p class="text-center text-xs text-gray-500">
      <PrivacyPolicyLink label="Personvern og informasjon" variant="muted" />
    </p>
  </AuthSplitLayout>
</template>
