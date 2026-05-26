import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePrivacyModalStore = defineStore('privacyModal', () => {
  const open = ref(false)

  function show() {
    open.value = true
  }

  function hide() {
    open.value = false
  }

  return { open, show, hide }
})
