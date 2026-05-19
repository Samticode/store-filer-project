<script setup lang="ts">
import AppAside from '@/components/AppAside.vue'
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <AppAside />
    <main class="flex min-h-screen flex-1 flex-col overflow-auto">
      <RouterView />
    </main>
  </div>
</template>
