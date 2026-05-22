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

export const MANAGEABLE_PROJECT_STATUSES = ['active', 'paused'] as const satisfies readonly ProjectStatus[]

export function manageableProjectStatusOptions() {
  return MANAGEABLE_PROJECT_STATUSES.map((status) => ({
    value: status,
    label: projectStatusLabel(status),
  }))
}

export function editProjectStatusOptions(currentStatus?: ProjectStatus) {
  const options = manageableProjectStatusOptions()

  if (currentStatus === 'finished') {
    return [
      { value: 'finished', label: projectStatusLabel('finished'), disabled: true },
      ...options,
    ]
  }

  return options
}
