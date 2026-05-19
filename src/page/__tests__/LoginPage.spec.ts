import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import '@/test/mocks/firebase'
import {
  mockSignIn,
  mockGetDoc,
  mockFirebaseUser,
  mockGetDocSuccess,
} from '@/test/mocks/firebase'
import LoginPage from '@/page/LoginPage.vue'

const push = vi.fn()

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push }),
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    push.mockReset()
    mockSignIn.mockResolvedValue({ user: mockFirebaseUser })
    mockGetDocSuccess()
  })

  function mountLoginPage() {
    return mount(LoginPage, {
      global: {
        plugins: [createPinia()],
      },
    })
  }

  it('calls login and navigates to role home on successful submit', async () => {
    const wrapper = mountLoginPage()

    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockSignIn).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith({ name: 'employee' })
  })

  it('shows error message when login fails', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'))
    const wrapper = mountLoginPage()

    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#password').setValue('wrong')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Invalid credentials')
    expect(push).not.toHaveBeenCalled()
  })
})
