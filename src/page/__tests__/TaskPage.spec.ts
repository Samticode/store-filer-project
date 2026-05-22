import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TaskPage from '@/page/TaskPage.vue'
import type { Task } from '@/types'
import type { Timestamp } from 'firebase/firestore'

const mockSubscribeTask = vi.fn()
const mockUnsubscribeTaskListener = vi.fn()
const mockSubscribeTaskUpdates = vi.fn()
const mockUnsubscribeTaskUpdatesListener = vi.fn()
const mockRecordStatusChange = vi.fn()
const mockSubscribeProject = vi.fn()
const mockUnsubscribeProjectListener = vi.fn()
const mockSyncLiveUserNameWatchers = vi.fn()
const mockClearLiveUserNameWatchers = vi.fn()

const mockCurrentTask = ref<Task | null>(null)
const mockCurrentTaskLoading = ref(false)
const mockCurrentTaskError = ref<string | null>(null)
const mockCurrentUser = ref<{ id: string; role: string; email: string; name: string } | null>(null)
const mockCurrentProject = ref<{ id: string; projectLeaderId: string } | null>(null)
const mockUpdates = ref<unknown[]>([])
const mockUpdatesLoading = ref(false)
const mockCreatingUpdate = ref(false)
const mockCreateError = ref<string | null>(null)
const mockUpdatesError = ref<string | null>(null)
const mockUserNameById = ref<Record<string, string>>({})

vi.mock('@/stores/tasks', () => ({
  useTasksStore: vi.fn(() => ({
    currentTask: mockCurrentTask,
    currentTaskLoading: mockCurrentTaskLoading,
    currentTaskError: mockCurrentTaskError,
    subscribeTask: mockSubscribeTask,
    unsubscribeTaskListener: mockUnsubscribeTaskListener,
  })),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    currentUser: mockCurrentUser,
  })),
}))

vi.mock('@/stores/projects', () => ({
  useProjectsStore: vi.fn(() => ({
    currentProject: mockCurrentProject,
    subscribeProject: mockSubscribeProject,
    unsubscribeProjectListener: mockUnsubscribeProjectListener,
  })),
}))

vi.mock('@/stores/taskUpdates', () => ({
  useTaskUpdatesStore: vi.fn(() => ({
    updates: mockUpdates,
    loading: mockUpdatesLoading,
    creating: mockCreatingUpdate,
    createError: mockCreateError,
    error: mockUpdatesError,
    subscribeTaskUpdates: mockSubscribeTaskUpdates,
    unsubscribeTaskUpdatesListener: mockUnsubscribeTaskUpdatesListener,
    recordStatusChange: mockRecordStatusChange,
  })),
}))

vi.mock('@/stores/users', () => ({
  useUsersStore: vi.fn(() => ({
    userNameById: mockUserNameById,
    syncLiveUserNameWatchers: mockSyncLiveUserNameWatchers,
    clearLiveUserNameWatchers: mockClearLiveUserNameWatchers,
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
      stubs: { AppSelect: true, UserAvatar: true },
    },
  })
}

describe('TaskPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockCurrentTask.value = null
    mockCurrentTaskLoading.value = false
    mockCurrentTaskError.value = null
    mockCurrentUser.value = null
    mockCurrentProject.value = null
    mockUpdates.value = []
    mockUpdatesLoading.value = false
    mockCreatingUpdate.value = false
    mockCreateError.value = null
    mockUpdatesError.value = null
    mockUserNameById.value = {}
    mockRecordStatusChange.mockResolvedValue(undefined)
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

  it('klikk på "Begynn oppgave" kaller recordStatusChange med in_progress', async () => {
    mockCurrentTask.value = makeTask({ status: 'not_started', assignedEmployeeId: 'employee-1' })
    mockCurrentUser.value = { id: 'employee-1', name: 'Ansatt', email: 'a@e.com', role: 'employee' }

    const wrapper = mountTaskPage()
    const startButton = wrapper.findAll('button').find((button) => button.text().includes('Begynn oppgave'))
    await startButton!.trigger('click')
    await flushPromises()

    expect(mockRecordStatusChange).toHaveBeenCalledWith({
      taskId: 'task-1',
      projectId: 'proj-1',
      text: 'Begynte oppgaven',
      createdBy: 'employee-1',
      statusChange: 'in_progress',
    })
  })

  it('klikk på "Fullfør oppgave" kaller recordStatusChange med pending_approval', async () => {
    mockCurrentTask.value = makeTask({ status: 'in_progress', assignedEmployeeId: 'employee-1' })
    mockCurrentUser.value = { id: 'employee-1', name: 'Ansatt', email: 'a@e.com', role: 'employee' }

    const wrapper = mountTaskPage()
    const completeButton = wrapper.findAll('button').find((button) => button.text().includes('Fullfør oppgave'))
    await completeButton!.trigger('click')
    await flushPromises()

    expect(mockRecordStatusChange).toHaveBeenCalledWith({
      taskId: 'task-1',
      projectId: 'proj-1',
      text: 'Sendte oppgaven til godkjenning',
      createdBy: 'employee-1',
      statusChange: 'pending_approval',
    })
  })

  it('viser feilmelding når recordStatusChange feiler', async () => {
    mockCurrentTask.value = makeTask({ status: 'not_started', assignedEmployeeId: 'employee-1' })
    mockCurrentUser.value = { id: 'employee-1', name: 'Ansatt', email: 'a@e.com', role: 'employee' }
    mockRecordStatusChange.mockRejectedValue(new Error('Feil'))
    mockCreateError.value = 'Kunne ikke oppdatere status. Prøv igjen.'

    const wrapper = mountTaskPage()
    const startButton = wrapper.findAll('button').find((button) => button.text().includes('Begynn oppgave'))
    await startButton!.trigger('click')
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
