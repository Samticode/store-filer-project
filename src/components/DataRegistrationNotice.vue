<script setup lang="ts">
import PrivacyPolicyLink from '@/components/PrivacyPolicyLink.vue'
</script>

<template>
  <aside
    class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"
    aria-labelledby="data-registration-heading"
  >
    <h2 id="data-registration-heading" class="font-medium">
      Registrering av arbeidsaktivitet
    </h2>
    <p class="mt-1 leading-relaxed text-blue-800">
      Oppdateringer, statusendringer, vedlegg og GitHub-commitmeldinger loggføres som del av
      oppgaven. Du kan se all registrert aktivitet i oppdateringsloggen. Les mer i
      <PrivacyPolicyLink variant="blue" />.
    </p>
  </aside>
</template>
