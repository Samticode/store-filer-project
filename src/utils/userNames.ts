import type { AuthUser } from '@/types'

export function normalizeUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    ...(user.role != null ? { role: user.role } : {}),
  }
}

export function mergeUsersForDisplay(
  users: AuthUser[],
  currentUser: AuthUser | null,
): AuthUser[] {
  const normalized = users.map(normalizeUser)

  if (!currentUser) {
    return normalized
  }

  const authUser = normalizeUser(currentUser)
  const index = normalized.findIndex((user) => user.id === authUser.id)

  if (index === -1) {
    return [authUser, ...normalized]
  }

  const merged = [...normalized]
  merged[index] = authUser
  return merged
}

export function buildUserNameById(
  users: AuthUser[],
  currentUser: AuthUser | null = null,
): Record<string, string> {
  return Object.fromEntries(
    mergeUsersForDisplay(users, currentUser).map((user) => [user.id, user.name]),
  )
}

export function resolveUserName(
  userId: string,
  users: AuthUser[],
  currentUser: AuthUser | null = null,
): string {
  if (currentUser?.id === userId) {
    return currentUser.name
  }

  return buildUserNameById(users, currentUser)[userId] ?? 'Ukjent'
}
