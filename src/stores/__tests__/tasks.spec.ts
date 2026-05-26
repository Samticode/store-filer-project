import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  mockAddDoc,
  mockBatchCommit,
  mockBatchSet,
  mockBatchUpdate,
  mockSetDoc,
  mockUpdateDoc,
} from '@/test/mocks/firebase'
import { useTaskUpdatesStore } from '@/stores/taskUpdates'
import { useTasksStore } from '@/stores/tasks'
import { TASK_APPROVAL_UPDATE_TEXT, TASK_REJECTION_UPDATE_TEXT } from '@/utils/taskLabels'

const mockUploadImage = vi.fn()
const mockUploadFile = vi.fn()

vi.mock('@/utils/taskUpdateStorage', () => ({
  uploadTaskUpdateImage: (...args: unknown[]) => mockUploadImage(...args),
  uploadTaskUpdateFile: (...args: unknown[]) => mockUploadFile(...args),
}))

const taskData = {
  title: 'Testoppgave',
  description: 'En beskrivelse',
  priority: 'medium' as const,
  status: 'not_started' as const,
  assignedEmployeeId: 'employee-1',
}

const statusChangeInput = {
  taskId: 'task-1',
  projectId: 'proj-1',
  text: 'Begynte oppgaven',
  createdBy: 'employee-1',
  statusChange: 'in_progress' as const,
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

  describe('updateTask', () => {
    it('kaller updateDoc med riktig data og oppdaterer prosjektets updatedAt', async () => {
      const store = useTasksStore()
      await store.updateTask('task-1', 'proj-1', taskData)

      expect(mockUpdateDoc).toHaveBeenCalledTimes(2)
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'Tasks/task-1' }),
        expect.objectContaining({
          title: 'Testoppgave',
          description: 'En beskrivelse',
          priority: 'medium',
          status: 'not_started',
          assignedEmployeeId: 'employee-1',
          updatedAt: expect.anything(),
        }),
      )
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'Projects/proj-1' }),
        expect.objectContaining({ updatedAt: expect.anything() }),
      )
    })

    it('setter updating=true under kall og false etterpå', async () => {
      const store = useTasksStore()
      let duringCall = false

      mockUpdateDoc.mockImplementation(async () => {
        duringCall = store.updating
      })

      await store.updateTask('task-1', 'proj-1', taskData)

      expect(duringCall).toBe(true)
      expect(store.updating).toBe(false)
    })

    it('setter updateError og kaster feil ved Firestore-feil', async () => {
      const store = useTasksStore()
      mockUpdateDoc.mockRejectedValue(new Error('Firestore feil'))

      await expect(store.updateTask('task-1', 'proj-1', taskData)).rejects.toThrow()
      expect(store.updateError).toBe('Kunne ikke oppdatere oppgave. Prøv igjen.')
      expect(store.updating).toBe(false)
    })
  })
})

describe('useTaskUpdatesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockBatchCommit.mockResolvedValue(undefined)
    mockSetDoc.mockResolvedValue(undefined)
    mockUpdateDoc.mockResolvedValue(undefined)
    mockUploadImage.mockResolvedValue('https://image-url.com')
    mockUploadFile.mockResolvedValue('https://file-url.com')
  })

  describe('recordStatusChange', () => {
    it('skriver oppdateringslogg og ny status via batch', async () => {
      const store = useTaskUpdatesStore()
      await store.recordStatusChange(statusChangeInput)

      expect(mockBatchSet).toHaveBeenCalledOnce()
      expect(mockBatchSet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          text: 'Begynte oppgaven',
          createdBy: 'employee-1',
          statusChange: 'in_progress',
          imageUrl: null,
          fileUrl: null,
          fileName: null,
          isFromGithub: false,
          createdAt: expect.anything(),
        }),
      )
      expect(mockBatchUpdate).toHaveBeenCalledTimes(2)
      expect(mockBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'Tasks/task-1' }),
        expect.objectContaining({
          status: 'in_progress',
          updatedAt: expect.anything(),
        }),
      )
      expect(mockBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'Projects/proj-1' }),
        expect.objectContaining({ updatedAt: expect.anything() }),
      )
      expect(mockBatchCommit).toHaveBeenCalledOnce()
    })

    it('setter creating=true under kall og false etterpå', async () => {
      const store = useTaskUpdatesStore()
      let duringCall = false

      mockBatchCommit.mockImplementation(async () => {
        duringCall = store.creating
      })

      await store.recordStatusChange(statusChangeInput)

      expect(duringCall).toBe(true)
      expect(store.creating).toBe(false)
    })

    it('setter createError og kaster feil ved Firestore-feil', async () => {
      const store = useTaskUpdatesStore()
      mockBatchCommit.mockRejectedValue(new Error('Firestore feil'))

      await expect(store.recordStatusChange(statusChangeInput)).rejects.toThrow()
      expect(store.createError).toBe('Kunne ikke oppdatere status. Prøv igjen.')
      expect(store.creating).toBe(false)
    })
  })

  describe('recordProjectLeaderReview', () => {
    const reviewInput = {
      taskId: 'task-1',
      projectId: 'proj-1',
      createdBy: 'leader-1',
    }

    it('godkjenner oppgave: skriver godkjennings-update og oppdaterer task og prosjekt', async () => {
      const store = useTaskUpdatesStore()
      await store.recordProjectLeaderReview({ ...reviewInput, approved: true })

      expect(mockBatchSet).toHaveBeenCalledOnce()
      expect(mockBatchSet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          text: TASK_APPROVAL_UPDATE_TEXT,
          createdBy: 'leader-1',
          statusChange: 'approved',
          imageUrl: null,
          fileUrl: null,
          fileName: null,
          isFromGithub: false,
        }),
      )
      expect(mockBatchUpdate).toHaveBeenCalledTimes(2)
      expect(mockBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'Tasks/task-1' }),
        expect.objectContaining({
          status: 'approved',
          approvedBy: 'leader-1',
          approvedAt: expect.anything(),
          updatedAt: expect.anything(),
        }),
      )
      expect(mockBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'Projects/proj-1' }),
        expect.objectContaining({ updatedAt: expect.anything() }),
      )
      expect(mockBatchCommit).toHaveBeenCalledOnce()
    })

    it('avviser oppgave: skriver avvisnings-update og setter task tilbake til in_progress', async () => {
      const store = useTaskUpdatesStore()
      await store.recordProjectLeaderReview({ ...reviewInput, approved: false })

      expect(mockBatchSet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          text: TASK_REJECTION_UPDATE_TEXT,
          statusChange: 'in_progress',
        }),
      )
      expect(mockBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'Tasks/task-1' }),
        expect.objectContaining({ status: 'in_progress', updatedAt: expect.anything() }),
      )
      expect(mockBatchCommit).toHaveBeenCalledOnce()
    })

    it('setter creating=true under kall og false etterpå', async () => {
      const store = useTaskUpdatesStore()
      let duringCall = false

      mockBatchCommit.mockImplementation(async () => {
        duringCall = store.creating
      })

      await store.recordProjectLeaderReview({ ...reviewInput, approved: true })

      expect(duringCall).toBe(true)
      expect(store.creating).toBe(false)
    })

    it('setter createError og kaster feil ved Firestore-feil', async () => {
      const store = useTaskUpdatesStore()
      mockBatchCommit.mockRejectedValue(new Error('Firestore feil'))

      await expect(
        store.recordProjectLeaderReview({ ...reviewInput, approved: true }),
      ).rejects.toThrow()
      expect(store.createError).toBe('Kunne ikke godkjenne oppgaven. Prøv igjen.')
      expect(store.creating).toBe(false)
    })

    it('setter riktig feilmelding ved avvisning som feiler', async () => {
      const store = useTaskUpdatesStore()
      mockBatchCommit.mockRejectedValue(new Error('Firestore feil'))

      await expect(
        store.recordProjectLeaderReview({ ...reviewInput, approved: false }),
      ).rejects.toThrow()
      expect(store.createError).toBe('Kunne ikke sende oppgaven tilbake. Prøv igjen.')
    })
  })

  describe('createUpdate', () => {
    const baseInput = {
      taskId: 'task-1',
      projectId: 'proj-1',
      text: 'Min oppdatering',
      createdBy: 'employee-1',
      statusChange: null,
      imageFile: null,
      file: null,
    }

    it('skriver oppdatering og oppdaterer task og prosjekt', async () => {
      const store = useTaskUpdatesStore()
      await store.createUpdate(baseInput)

      expect(mockSetDoc).toHaveBeenCalledOnce()
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          text: 'Min oppdatering',
          createdBy: 'employee-1',
          statusChange: null,
          imageUrl: null,
          fileUrl: null,
          fileName: null,
          isFromGithub: false,
        }),
      )
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2)
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'Tasks/task-1' }),
        expect.objectContaining({ updatedAt: expect.anything() }),
      )
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'Projects/proj-1' }),
        expect.objectContaining({ updatedAt: expect.anything() }),
      )
    })

    it('laster opp bilde og setter imageUrl i setDoc', async () => {
      const store = useTaskUpdatesStore()
      const imageFile = new File(['img'], 'foto.jpg', { type: 'image/jpeg' })

      await store.createUpdate({ ...baseInput, imageFile })

      expect(mockUploadImage).toHaveBeenCalledOnce()
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ imageUrl: 'https://image-url.com', fileUrl: null }),
      )
    })

    it('laster opp fil og setter fileUrl og fileName i setDoc', async () => {
      const store = useTaskUpdatesStore()
      const file = new File(['data'], 'rapport.pdf', { type: 'application/pdf' })

      await store.createUpdate({ ...baseInput, file })

      expect(mockUploadFile).toHaveBeenCalledOnce()
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ fileUrl: 'https://file-url.com', fileName: 'rapport.pdf' }),
      )
    })

    it('inkluderer statusChange i task-oppdatering når det er satt', async () => {
      const store = useTaskUpdatesStore()
      await store.createUpdate({ ...baseInput, statusChange: 'pending_approval' })

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'Tasks/task-1' }),
        expect.objectContaining({ status: 'pending_approval', updatedAt: expect.anything() }),
      )
    })

    it('setter creating=true under kall og false etterpå', async () => {
      const store = useTaskUpdatesStore()
      let duringCall = false

      mockSetDoc.mockImplementation(async () => {
        duringCall = store.creating
      })

      await store.createUpdate(baseInput)

      expect(duringCall).toBe(true)
      expect(store.creating).toBe(false)
    })

    it('setter createError og kaster feil ved Firestore-feil', async () => {
      const store = useTaskUpdatesStore()
      mockSetDoc.mockRejectedValue(new Error('Firestore feil'))

      await expect(store.createUpdate(baseInput)).rejects.toThrow()
      expect(store.createError).toBe('Kunne ikke sende oppdatering. Prøv igjen.')
      expect(store.creating).toBe(false)
    })
  })
})
