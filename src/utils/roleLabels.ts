import type { UserRole } from '@/types'

export const ROLE_LABELS: Record<UserRole, string> = {
  projectLeader: 'Prosjektleder',
  management: 'Ledelse',
  employee: 'Ansatt',
}

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  projectLeader: 'bg-[#EFCB68] text-[#364652]',
  management: 'bg-[#C9DCB3] text-[#364652]',
  employee: 'bg-[#364652] text-white',
}

export const PENDING_ROLE_LABEL = 'Venter på godkjenning'
export const PENDING_BADGE_CLASS = 'bg-amber-100 text-amber-800'

export function roleLabel(role?: UserRole) {
  return role ? ROLE_LABELS[role] : PENDING_ROLE_LABEL
}

export function roleBadgeClass(role?: UserRole) {
  return role ? ROLE_BADGE_CLASSES[role] : PENDING_BADGE_CLASS
}
