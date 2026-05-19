import type { UserRole } from '@/types'

export const ROLE_ROUTE_NAMES = {
  projectLeader: 'project-leader',
  management: 'management',
  employee: 'employee',
} as const satisfies Record<UserRole, string>

export function routeNameForRole(role: UserRole) {
  return ROLE_ROUTE_NAMES[role]
}
