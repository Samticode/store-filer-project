<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="flex min-h-screen">
    <div class="relative hidden flex-2 overflow-hidden bg-green-800 lg:flex">
      <div class="relative flex flex-col justify-end p-12 xl:p-16">
        <p class="text-sm font-medium uppercase tracking-widest text-violet-200/80">Store Filer AS</p>
        <h2 class="mt-1 max-w-md text-3xl font-semibold leading-tight text-white xl:text-4xl">
          Rollebasert prosjektstyring for hele teamet
        </h2>
      </div>
    </div>

    <div
      class="flex w-full flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-12 sm:px-10 lg:max-w-md lg:flex-none lg:shrink-0 xl:max-w-lg"
    >
      <div class="w-full max-w-sm space-y-6">
        <h1 class="text-2xl font-semibold text-gray-800">{{ title }}</h1>
        <slot />
      </div>
    </div>
  </div>
</template>
