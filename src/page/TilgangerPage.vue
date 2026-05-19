<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Pencil } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import EditUserModal, { type EditUserPayload } from '@/components/EditUserModal.vue'
import { useUsersStore } from '@/stores/users'
import type { AuthUser } from '@/types'
import { roleBadgeClass, roleLabel } from '@/utils/roleLabels'

const usersStore = useUsersStore()
const { users, loading, error } = storeToRefs(usersStore)

const isEditModalOpen = ref(false)
const editingUser = ref<AuthUser | null>(null)
const saving = ref(false)
const updateError = ref<string | null>(null)

onMounted(() => {
  usersStore.fetchUsers()
})

function openEditModal(user: AuthUser) {
  editingUser.value = user
  updateError.value = null
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  editingUser.value = null
  updateError.value = null
}

async function handleSave(payload: EditUserPayload) {
  if (!editingUser.value) return

  updateError.value = null
  saving.value = true
  try {
    await usersStore.updateUser(editingUser.value.id, payload)
    closeEditModal()
  } catch (e) {
    console.error('Kunne ikke oppdatere bruker:', e)
    updateError.value = 'Kunne ikke oppdatere bruker. Prøv igjen.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col px-10 py-19">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold text-gray-900">Tilganger</h1>
      <p class="text-sm text-gray-500">
        Administrer brukere og tildel roller for å gi tilgang til appen.
      </p>
    </div>

    <div class="mt-8">
      <p v-if="loading" class="text-sm text-gray-500">Laster brukere…</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="users.length === 0" class="text-sm text-gray-500">Ingen brukere funnet.</p>

      <div
        v-else
        class="overflow-hidden rounded-lg border border-gray-200 bg-white"
      >
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Navn
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                E-post
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Rolle
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Handlinger</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {{ user.name }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {{ user.email }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm">
                <span
                  class="inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium"
                  :class="roleBadgeClass(user.role)"
                >
                  {{ roleLabel(user.role) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  @click="openEditModal(user)"
                >
                  <Pencil :size="14" />
                  Rediger
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <EditUserModal
      v-model="isEditModalOpen"
      :user="editingUser"
      :saving="saving"
      :error="updateError"
      @save="handleSave"
    />
  </div>
</template>
