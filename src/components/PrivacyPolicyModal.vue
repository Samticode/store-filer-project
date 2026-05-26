<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AppModal from '@/components/AppModal.vue'
import PrivacyPolicyContent from '@/components/PrivacyPolicyContent.vue'
import { usePrivacyModalStore } from '@/stores/privacyModal'

const privacyModal = usePrivacyModalStore()
const { open } = storeToRefs(privacyModal)
</script>

<template>
  <AppModal
    v-model="open"
    title="Personvern og informasjon"
    description="Slik behandler vi personopplysninger og logger arbeidsaktivitet."
    size="2xl"
    @close="privacyModal.hide()"
  >
    <div class="max-h-[60vh] overflow-y-auto pr-1">
      <PrivacyPolicyContent />
    </div>
  </AppModal>
</template>
