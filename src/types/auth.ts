export type UserRole = 'projectLeader' | 'management' | 'employee'

export const USER_ROLES = ['projectLeader', 'management', 'employee'] as const satisfies readonly UserRole[]

export interface AuthUserProfile {
  email: string
  name: string
  role?: UserRole
}

export type AuthUser = AuthUserProfile & {
  id: string
}

export const USERS_COLLECTION = 'Users' as const

export function hasUserRole(user: AuthUser | null | undefined): user is AuthUser & { role: UserRole } {
  return user?.role != null
}
