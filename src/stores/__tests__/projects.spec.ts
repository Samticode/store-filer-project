import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { query, where } from 'firebase/firestore'
import { mockAddDoc, mockUpdateDoc } from '@/test/mocks/firebase'
import { useProjectsStore } from '@/stores/projects'

const projectData = {
  name: 'Testprosjekt',
  description: 'En beskrivelse',
  projectLeaderId: 'leader-1',
}

describe('useProjectsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockAddDoc.mockResolvedValue({ id: 'new-id' })
    mockUpdateDoc.mockResolvedValue(undefined)
  })

  describe('createProject', () => {
    it('kaller addDoc med riktig data inkludert status og tidsstempler', async () => {
      const store = useProjectsStore()
      await store.createProject(projectData)

      expect(mockAddDoc).toHaveBeenCalledOnce()
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Testprosjekt',
          description: 'En beskrivelse',
          projectLeaderId: 'leader-1',
          status: 'active',
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        }),
      )
    })

    it('setter creating=true under kall og false etterpå', async () => {
      const store = useProjectsStore()
      let duringCall = false

      mockAddDoc.mockImplementation(async () => {
        duringCall = store.creating
        return { id: 'new-id' }
      })

      await store.createProject(projectData)

      expect(duringCall).toBe(true)
      expect(store.creating).toBe(false)
    })

    it('setter createError og kaster feil ved Firestore-feil', async () => {
      const store = useProjectsStore()
      mockAddDoc.mockRejectedValue(new Error('Firestore feil'))

      await expect(store.createProject(projectData)).rejects.toThrow()
      expect(store.createError).toBe('Kunne ikke opprette prosjekt. Prøv igjen.')
      expect(store.creating).toBe(false)
    })
  })

  describe('updateProject', () => {
    it('kaller updateDoc med riktig prosjekt-id og data', async () => {
      const store = useProjectsStore()
      await store.updateProject('proj-1', projectData)

      expect(mockUpdateDoc).toHaveBeenCalledOnce()
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('proj-1') }),
        expect.objectContaining({
          name: 'Testprosjekt',
          description: 'En beskrivelse',
          projectLeaderId: 'leader-1',
          updatedAt: expect.anything(),
        }),
      )
    })

    it('setter updating=true under kall og false etterpå', async () => {
      const store = useProjectsStore()
      let duringCall = false

      mockUpdateDoc.mockImplementation(async () => {
        duringCall = store.updating
      })

      await store.updateProject('proj-1', projectData)

      expect(duringCall).toBe(true)
      expect(store.updating).toBe(false)
    })

    it('setter updateError og kaster feil ved Firestore-feil', async () => {
      const store = useProjectsStore()
      mockUpdateDoc.mockRejectedValue(new Error('Firestore feil'))

      await expect(store.updateProject('proj-1', projectData)).rejects.toThrow()
      expect(store.updateError).toBe('Kunne ikke oppdatere prosjekt. Prøv igjen.')
      expect(store.updating).toBe(false)
    })
  })

  describe('subscribeLeaderProjects', () => {
    it('setter projectsSource til en query filtrert på leaderId', () => {
      const store = useProjectsStore()
      store.subscribeLeaderProjects('leader-42')

      expect(where).toHaveBeenCalledWith('projectLeaderId', '==', 'leader-42')
      expect(query).toHaveBeenCalled()
    })
  })
})
