import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TaskPage from '@/page/TaskPage.vue'
import type { Task } from '@/types'
import type { Timestamp } from 'firebase/firestore'

const mockUpdateTaskStatus = vi.fn()
const mockSubscribeTask = vi.fn()
const mockUnsubscribeTaskListener = vi.fn()
const mockSubscribeUsers = vi.fn()
const mockUnsubscribeUsersListener = vi.fn()

const mockCurrentTask = ref<Task | null>(null)
const mockUpdatingStatus = ref(false)
const mockUpdateStatusError = ref<string | null>(null)
const mockCurrentTaskLoading = ref(false)
const mockCurrentTaskError = ref<string | null>(null)
const mockCurrentUser = ref<{ id: string; role: string; email: string; name: string } | null>(null)
const mockUsers = ref<{ id: string; name: string; role: string; email: string }[]>([])

vi.mock('@/stores/tasks', () => ({
  useTasksStore: vi.fn(() => ({
    currentTask: mockCurrentTask,
    updatingStatus: mockUpdatingStatus,
    updateStatusError: mockUpdateStatusError,
    currentTaskLoading: mockCurrentTaskLoading,
    currentTaskError: mockCurrentTaskError,
    subscribeTask: mockSubscribeTask,
    unsubscribeTaskListener: mockUnsubscribeTaskListener,
    updateTaskStatus: mockUpdateTaskStatus,
  })),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    currentUser: mockCurrentUser,
  })),
}))

vi.mock('@/stores/users', () => ({
  useUsersStore: vi.fn(() => ({
    users: mockUsers,
    subscribeUsers: mockSubscribeUsers,
    unsubscribeUsersListener: mockUnsubscribeUsersListener,
  })),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return { ...actual, useRoute: () => ({ params: { taskId: 'task-1' } }) }
})

function makeTimestamp(ms = 0): Timestamp {
  return { toMillis: () => ms, toDate: () => new Date(ms) } as unknown as Timestamp
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Testoppgave',
    description: 'En beskrivelse av oppgaven',
    priority: 'medium',
    status: 'not_started',
    assignedEmployeeId: 'employee-1',
    projectId: 'proj-1',
    createdBy: 'leader-1',
    approvedBy: null,
    approvedAt: null,
    createdAt: makeTimestamp(),
    updatedAt: makeTimestamp(),
    ...overrides,
  }
}

function mountTaskPage() {
  return mount(TaskPage, {
    global: {
      plugins: [createPinia()],
      stubs: { AppSelect: true },
    },
  })
}

describe('TaskPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockCurrentTask.value = null
    mockUpdatingStatus.value = false
    mockUpdateStatusError.value = null
    mockCurrentTaskLoading.value = false
    mockCurrentTaskError.value = null
    mockCurrentUser.value = null
    mockUsers.value = []
    mockUpdateTaskStatus.mockResolvedValue(undefined)
  })

  it('viser oppgavetittel og beskrivelse når oppgave er lastet', () => {
    mockCurrentTask.value = makeTask()
    const wrapper = mountTaskPage()

    expect(wrapper.text()).toContain('Testoppgave')
    expect(wrapper.text()).toContain('En beskrivelse av oppgaven')
  })

  it('tildelt ansatt ser "Begynn oppgave"-knapp når status er not_started', () => {
    mockCurrentTask.value = makeTask({ status: 'not_started', assignedEmployeeId: 'employee-1' })
    mockCurrentUser.value = { id: 'employee-1', name: 'Ansatt', email: 'a@e.com', role: 'employee' }

    const wrapper = mountTaskPage()

    expect(wrapper.text()).toContain('Begynn oppgave')
  })

  it('klikk på "Begynn oppgave" kaller updateTaskStatus med in_progress', async () => {
    mockCurrentTask.value = makeTask({ status: 'not_started', assignedEmployeeId: 'employee-1' })
    mockCurrentUser.value = { id: 'employee-1', name: 'Ansatt', email: 'a@e.com', role: 'employee' }

    const wrapper = mountTaskPage()
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(mockUpdateTaskStatus).toHaveBeenCalledWith('task-1', 'in_progress')
  })

  it('klikk på "Fullfør oppgave" kaller updateTaskStatus med pending_approval', async () => {
    mockCurrentTask.value = makeTask({ status: 'in_progress', assignedEmployeeId: 'employee-1' })
    mockCurrentUser.value = { id: 'employee-1', name: 'Ansatt', email: 'a@e.com', role: 'employee' }

    const wrapper = mountTaskPage()
    const buttons = wrapper.findAll('button')
    const fullfør = buttons.find((b) => b.text().includes('Fullfør'))
    await fullfør!.trigger('click')
    await flushPromises()

    expect(mockUpdateTaskStatus).toHaveBeenCalledWith('task-1', 'pending_approval')
  })

  it('viser feilmelding når updateTaskStatus feiler', async () => {
    mockCurrentTask.value = makeTask({ status: 'not_started', assignedEmployeeId: 'employee-1' })
    mockCurrentUser.value = { id: 'employee-1', name: 'Ansatt', email: 'a@e.com', role: 'employee' }
    mockUpdateTaskStatus.mockRejectedValue(new Error('Feil'))
    mockUpdateStatusError.value = 'Kunne ikke oppdatere status. Prøv igjen.'

    const wrapper = mountTaskPage()
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Kunne ikke oppdatere status. Prøv igjen.')
  })

  it('ikke-tildelt bruker ser ikke statusendrings-seksjonen', () => {
    mockCurrentTask.value = makeTask({ status: 'not_started', assignedEmployeeId: 'employee-1' })
    mockCurrentUser.value = { id: 'other-user', name: 'Annen', email: 'b@e.com', role: 'employee' }

    const wrapper = mountTaskPage()

    expect(wrapper.text()).not.toContain('Begynn oppgave')
    expect(wrapper.text()).not.toContain('Endre status')
  })
})
