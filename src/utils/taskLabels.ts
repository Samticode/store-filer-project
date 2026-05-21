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

export function statusChangeLogText(from: TaskStatus, to: TaskStatus) {
  if (from === 'not_started' && to === 'in_progress') return 'Begynte oppgaven'
  if (from === 'in_progress' && to === 'pending_approval') return 'Sendte oppgaven til godkjenning'
  if (from === 'in_progress' && to === 'not_started') return 'Satte oppgaven tilbake til ikke startet'
  if (from === 'pending_approval' && to === 'in_progress') return 'Fortsatte arbeidet med oppgaven'
  return `Endret status til ${taskStatusLabel(to)}`
}

export const TASK_APPROVAL_UPDATE_TEXT = 'Oppgaven er godkjent. Bra jobba!'
export const TASK_REJECTION_UPDATE_TEXT = 'Oppgaven ble ikke godkjent.'

export function taskUpdateCardClass(statusChange: TaskStatus | null, text = '') {
  if (statusChange === 'approved') {
    return 'border-green-700 bg-emerald-50'
  }
  if (statusChange === 'pending_approval') {
    return 'border-amber-600 bg-amber-50'
  }
  if (statusChange === 'in_progress' && text === TASK_REJECTION_UPDATE_TEXT) {
    return 'border-rose-600 bg-rose-50'
  }
  return 'border-green-800 bg-green-50'
}

export function taskUpdateAttachmentBorderClass(statusChange: TaskStatus | null, text = '') {
  if (statusChange === 'approved') return 'border-emerald-200'
  if (statusChange === 'pending_approval') return 'border-amber-200'
  if (statusChange === 'in_progress' && text === TASK_REJECTION_UPDATE_TEXT) return 'border-rose-200'
  return 'border-green-200'
}

export function taskUpdateLinkClass(statusChange: TaskStatus | null, text = '') {
  if (statusChange === 'approved') return 'text-green-800 hover:text-green-700'
  if (statusChange === 'pending_approval') return 'text-amber-800 hover:text-amber-700'
  if (statusChange === 'in_progress' && text === TASK_REJECTION_UPDATE_TEXT) {
    return 'text-rose-800 hover:text-rose-700'
  }
  return 'text-green-800 hover:text-green-700'
}

export function taskUpdateStatusTextClass(statusChange: TaskStatus | null, text = '') {
  if (statusChange === 'approved') return 'font-medium text-green-800'
  if (statusChange === 'pending_approval') return 'font-medium text-amber-800'
  if (statusChange === 'in_progress' && text === TASK_REJECTION_UPDATE_TEXT) {
    return 'font-medium text-rose-800'
  }
  return 'text-gray-500'
}
