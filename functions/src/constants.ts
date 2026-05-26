export function getGithubSystemUid(): string {
  const uid = process.env.GITHUB_SYSTEM_UID?.trim()
  if (!uid) {
    throw new Error('GITHUB_SYSTEM_UID environment variable is not set')
  }
  return uid
}

export function getGithubWebhookSecret(): string {
  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim()
  if (!secret) {
    throw new Error('GITHUB_WEBHOOK_SECRET environment variable is not set')
  }
  return secret
}

export const PROJECTS_COLLECTION = 'Projects'
export const TASKS_COLLECTION = 'Tasks'
export const TASK_UPDATES_SUBCOLLECTION = 'Updates'
