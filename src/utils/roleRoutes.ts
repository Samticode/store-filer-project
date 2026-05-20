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

export function projectRouteNameForUser(user: AuthUser | null | undefined) {
  if (user && hasUserRole(user) && user.role === 'projectLeader') {
    return 'project-leader-project'
  }
  return 'management-project'
}

export function taskRouteForTask(
  user: AuthUser | null | undefined,
  task: { id: string; projectId: string },
) {
  if (!user || !hasUserRole(user)) return null

  if (user.role === 'employee') {
    return { name: 'employee-task' as const, params: { taskId: task.id } }
  }

  const name =
    user.role === 'projectLeader' ? ('project-leader-task' as const) : ('management-task' as const)

  return {
    name,
    params: { projectId: task.projectId, taskId: task.id },
  }
}
