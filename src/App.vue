<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FirebaseStatus from '@/components/FirebaseStatus.vue'
import AppLayout from '@/layouts/AppLayout.vue'

const route = useRoute()
const showFirebaseStatus = import.meta.env.VITE_SHOW_FIREBASE_STATUS === 'true'
const showAppLayout = computed(() => route.meta.appLayout === true || route.meta.role != null)
</script>

<template>
  <AppLayout v-if="showAppLayout" />
  <RouterView v-else />
  <FirebaseStatus v-if="showFirebaseStatus" />
</template>
