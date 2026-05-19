<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const { currentUser } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="flex flex-1 flex-col px-10 py-19">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold text-gray-900">
        Heisann {{ currentUser?.name }}
      </h1>
    </div>
  </div>
</template>
