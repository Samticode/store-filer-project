import type { TaskPriority, TaskStatus } from '@/types'

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Lav',
  medium: 'Middel',
  high: 'Høy',
  critical: 'Kritisk',
}

export const TASK_PRIORITY_BADGE_CLASSES: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Ikke startet',
  in_progress: 'Pågår',
  pending_approval: 'Til godkjenning',
  approved: 'Godkjent',
}

export const TASK_STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-amber-100 text-amber-800',
  pending_approval: 'bg-sky-100 text-sky-800',
  approved: 'bg-green-100 text-green-800',
}

export function taskPriorityLabel(priority: TaskPriority) {
  return TASK_PRIORITY_LABELS[priority]
}

export function taskPriorityBadgeClass(priority: TaskPriority) {
  return TASK_PRIORITY_BADGE_CLASSES[priority]
}

export function taskStatusLabel(status: TaskStatus) {
  return TASK_STATUS_LABELS[status]
}

export function taskStatusBadgeClass(status: TaskStatus) {
  return TASK_STATUS_BADGE_CLASSES[status]
}
