import type { Timestamp } from 'firebase/firestore'
import type { TaskStatus } from './task'

export const TASK_UPDATES_SUBCOLLECTION = 'Updates' as const

export interface TaskUpdateData {
  text: string
  createdBy: string
  statusChange: TaskStatus | null
  imageUrl: string | null
  fileUrl: string | null
  fileName: string | null
}

export type TaskUpdate = TaskUpdateData & {
  id: string
  createdAt: Timestamp
}

export interface CreateTaskUpdateInput {
  taskId: string
  projectId: string
  text: string
  createdBy: string
  statusChange: TaskStatus | null
  imageFile: File | null
  file: File | null
}

export interface RecordStatusChangeInput {
  taskId: string
  projectId: string
  text: string
  createdBy: string
  statusChange: TaskStatus
}

export interface RecordProjectLeaderReviewInput {
  taskId: string
  projectId: string
  createdBy: string
  approved: boolean
}
