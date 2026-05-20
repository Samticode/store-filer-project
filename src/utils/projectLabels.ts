import type { ProjectStatus } from '@/types'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Aktiv',
  paused: 'Pauset',
  finished: 'Fullført',
}

export const PROJECT_STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-amber-100 text-amber-800',
  finished: 'bg-gray-100 text-gray-700',
}

export function projectStatusLabel(status: ProjectStatus) {
  return PROJECT_STATUS_LABELS[status]
}

export function projectStatusBadgeClass(status: ProjectStatus) {
  return PROJECT_STATUS_BADGE_CLASSES[status]
}
