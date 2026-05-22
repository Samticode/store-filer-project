import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useCollection } from 'vuefire'
import { query, where } from 'firebase/firestore'
import { usePendingApprovalTasksStore } from '@/stores/pendingApprovalTasks'
import type { Task } from '@/types'
import type { Timestamp } from 'firebase/firestore'

function makeTimestamp(ms = 0): Timestamp {
  return { toMillis: () => ms, toDate: () => new Date(ms) } as unknown as Timestamp
}

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'task-1',
    title: 'Testoppgave',
    description: 'Beskrivelse',
    priority: 'medium',
    status: 'pending_approval',
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

function makeMockCollection(tasks: Task[]) {
  const tasksRef = ref(tasks)
  return Object.assign(tasksRef, {
    pending: ref(false),
    error: ref(undefined),
    promise: ref(Promise.resolve(tasks)),
  })
}

describe('usePendingApprovalTasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(useCollection).mockReturnValue(
      makeMockCollection([]) as ReturnType<typeof useCollection>,
    )
  })

  describe('syncForProjects', () => {
    it('setter opp query med projectId og pending_approval status for gitte prosjekter', () => {
      const store = usePendingApprovalTasksStore()
      store.syncForProjects(['proj-1', 'proj-2'])

      expect(where).toHaveBeenCalledWith('projectId', 'in', ['proj-1', 'proj-2'])
      expect(where).toHaveBeenCalledWith('status', '==', 'pending_approval')
      expect(query).toHaveBeenCalled()
    })

    it('setter source til null ved tom prosjektliste', () => {
      const store = usePendingApprovalTasksStore()
      store.syncForProjects(['proj-1'])
      store.syncForProjects([])

      expect(store.loading).toBe(false)
      expect(store.tasks).toHaveLength(0)
    })

    it('begrenser til maks 10 prosjekter i query', () => {
      const store = usePendingApprovalTasksStore()
      const ids = Array.from({ length: 15 }, (_, i) => `proj-${i}`)
      store.syncForProjects(ids)

      expect(where).toHaveBeenCalledWith('projectId', 'in', ids.slice(0, 10))
    })
  })

  describe('tasks', () => {
    it('returnerer kun oppgaver med status pending_approval', () => {
      const tasks = [
        makeTask({ id: '1', status: 'pending_approval', updatedAt: makeTimestamp(3000) }),
        makeTask({ id: '2', status: 'in_progress', updatedAt: makeTimestamp(2000) }),
        makeTask({ id: '3', status: 'approved', updatedAt: makeTimestamp(1000) }),
        makeTask({ id: '4', status: 'pending_approval', updatedAt: makeTimestamp(4000) }),
      ]
      vi.mocked(useCollection).mockReturnValue(
        makeMockCollection(tasks) as ReturnType<typeof useCollection>,
      )

      const store = usePendingApprovalTasksStore()

      expect(store.tasks).toHaveLength(2)
      expect(store.tasks.every((t) => t.status === 'pending_approval')).toBe(true)
    })

    it('sorterer oppgaver med nyeste updatedAt først', () => {
      const tasks = [
        makeTask({ id: '1', status: 'pending_approval', updatedAt: makeTimestamp(1000) }),
        makeTask({ id: '2', status: 'pending_approval', updatedAt: makeTimestamp(3000) }),
        makeTask({ id: '3', status: 'pending_approval', updatedAt: makeTimestamp(2000) }),
      ]
      vi.mocked(useCollection).mockReturnValue(
        makeMockCollection(tasks) as ReturnType<typeof useCollection>,
      )

      const store = usePendingApprovalTasksStore()
      const ids = store.tasks.map((t) => t.id)

      expect(ids).toEqual(['2', '3', '1'])
    })
  })

  describe('count', () => {
    it('reflekterer antall pending_approval oppgaver', () => {
      const tasks = [
        makeTask({ id: '1', status: 'pending_approval' }),
        makeTask({ id: '2', status: 'pending_approval' }),
        makeTask({ id: '3', status: 'in_progress' }),
      ]
      vi.mocked(useCollection).mockReturnValue(
        makeMockCollection(tasks) as ReturnType<typeof useCollection>,
      )

      const store = usePendingApprovalTasksStore()

      expect(store.count).toBe(2)
    })

    it('er 0 når det ikke er noen oppgaver til godkjenning', () => {
      const store = usePendingApprovalTasksStore()

      expect(store.count).toBe(0)
    })
  })
})
