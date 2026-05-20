import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockAddDoc, mockUpdateDoc } from '@/test/mocks/firebase'
import { useTasksStore } from '@/stores/tasks'

const taskData = {
  title: 'Testoppgave',
  description: 'En beskrivelse',
  priority: 'medium' as const,
  status: 'not_started' as const,
  assignedEmployeeId: 'employee-1',
}

describe('useTasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockAddDoc.mockResolvedValue({ id: 'new-task-id' })
    mockUpdateDoc.mockResolvedValue(undefined)
  })

  describe('createTask', () => {
    it('kaller addDoc med riktig data inkludert projectId, createdBy og approvedBy=null', async () => {
      const store = useTasksStore()
      await store.createTask('proj-1', 'user-2', taskData)

      expect(mockAddDoc).toHaveBeenCalledOnce()
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          title: 'Testoppgave',
          description: 'En beskrivelse',
          priority: 'medium',
          status: 'not_started',
          assignedEmployeeId: 'employee-1',
          projectId: 'proj-1',
          createdBy: 'user-2',
          approvedBy: null,
          approvedAt: null,
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        }),
      )
    })

    it('setter creating=true under kall og false etterpå', async () => {
      const store = useTasksStore()
      let duringCall = false

      mockAddDoc.mockImplementation(async () => {
        duringCall = store.creating
        return { id: 'new-task-id' }
      })

      await store.createTask('proj-1', 'user-2', taskData)

      expect(duringCall).toBe(true)
      expect(store.creating).toBe(false)
    })

    it('setter createError og kaster feil ved Firestore-feil', async () => {
      const store = useTasksStore()
      mockAddDoc.mockRejectedValue(new Error('Firestore feil'))

      await expect(store.createTask('proj-1', 'user-2', taskData)).rejects.toThrow()
      expect(store.createError).toBe('Kunne ikke opprette oppgave. Prøv igjen.')
      expect(store.creating).toBe(false)
    })
  })

  describe('updateTaskStatus', () => {
    it('kaller updateDoc med riktig oppgave-id og ny status', async () => {
      const store = useTasksStore()
      await store.updateTaskStatus('task-1', 'in_progress')

      expect(mockUpdateDoc).toHaveBeenCalledOnce()
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('task-1') }),
        expect.objectContaining({
          status: 'in_progress',
          updatedAt: expect.anything(),
        }),
      )
    })

    it('setter updatingStatus=true under kall og false etterpå', async () => {
      const store = useTasksStore()
      let duringCall = false

      mockUpdateDoc.mockImplementation(async () => {
        duringCall = store.updatingStatus
      })

      await store.updateTaskStatus('task-1', 'in_progress')

      expect(duringCall).toBe(true)
      expect(store.updatingStatus).toBe(false)
    })

    it('setter updateStatusError og kaster feil ved Firestore-feil', async () => {
      const store = useTasksStore()
      mockUpdateDoc.mockRejectedValue(new Error('Firestore feil'))

      await expect(store.updateTaskStatus('task-1', 'in_progress')).rejects.toThrow()
      expect(store.updateStatusError).toBe('Kunne ikke oppdatere status. Prøv igjen.')
      expect(store.updatingStatus).toBe(false)
    })
  })
})
