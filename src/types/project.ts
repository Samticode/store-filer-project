import type { Timestamp } from 'firebase/firestore'

export type ProjectStatus = 'active' | 'paused' | 'finished'

export const PROJECT_STATUSES = ['active', 'paused', 'finished'] as const satisfies readonly ProjectStatus[]

export const PROJECT_STATUS_ACTIVE = 'active' as const satisfies ProjectStatus
export const PROJECT_STATUS_PAUSED = 'paused' as const satisfies ProjectStatus
export const PROJECT_STATUS_FINISHED = 'finished' as const satisfies ProjectStatus

export interface ProjectData {
  name: string
  description: string
  projectLeaderId: string
  githubRepo?: string | null
}

export type ProjectUpdateData = ProjectData & {
  status: ProjectStatus
}

export type Project = ProjectData & {
  id: string
  status: ProjectStatus
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const PROJECTS_COLLECTION = 'Projects' as const
