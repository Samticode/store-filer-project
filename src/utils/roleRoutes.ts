import type { AuthUser, UserRole } from '@/types'
import { hasUserRole } from '@/types'

export const ROLE_ROUTE_NAMES = {
  projectLeader: 'project-leader',
  management: 'management',
  employee: 'employee',
} as const satisfies Record<UserRole, string>

export const PENDING_APPROVAL_ROUTE_NAME = 'pending-approval' as const

export function routeNameForRole(role: UserRole) {
  return ROLE_ROUTE_NAMES[role]
}

export function homeRouteNameForUser(user: AuthUser | null | undefined) {
  if (!user) return null
  if (!hasUserRole(user)) return PENDING_APPROVAL_ROUTE_NAME
  return routeNameForRole(user.role)
}
