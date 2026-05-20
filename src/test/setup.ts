import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import '@/test/mocks/vuefire'
import '@/test/mocks/firebase'

config.global.stubs = {
  RouterLink: {
    template: '<a><slot /></a>',
    props: ['to'],
  },
  RouterView: true,
}

vi.spyOn(console, 'error').mockImplementation(() => {})
