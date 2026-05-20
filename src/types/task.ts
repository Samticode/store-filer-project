import type { Timestamp } from 'firebase/firestore'

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const satisfies readonly TaskPriority[]

export const TASK_PRIORITY_LOW = 'low' as const satisfies TaskPriority
export const TASK_PRIORITY_MEDIUM = 'medium' as const satisfies TaskPriority
export const TASK_PRIORITY_HIGH = 'high' as const satisfies TaskPriority
export const TASK_PRIORITY_CRITICAL = 'critical' as const satisfies TaskPriority

export type TaskStatus = 'not_started' | 'in_progress' | 'pending_approval' | 'approved'

export const TASK_STATUSES = [
  'not_started',
  'in_progress',
  'pending_approval',
  'approved',
] as const satisfies readonly TaskStatus[]

export const TASK_STATUS_NOT_STARTED = 'not_started' as const satisfies TaskStatus
export const TASK_STATUS_IN_PROGRESS = 'in_progress' as const satisfies TaskStatus
export const TASK_STATUS_PENDING_APPROVAL = 'pending_approval' as const satisfies TaskStatus
export const TASK_STATUS_APPROVED = 'approved' as const satisfies TaskStatus

export interface TaskData {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  assignedEmployeeId: string
}

export type Task = TaskData & {
  id: string
  projectId: string
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  approvedBy: string | null
  approvedAt: Timestamp | null
}

export const TASKS_COLLECTION = 'Tasks' as const
