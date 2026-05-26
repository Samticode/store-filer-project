import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import {
  getGithubSystemUid,
  PROJECTS_COLLECTION,
  TASKS_COLLECTION,
  TASK_UPDATES_SUBCOLLECTION,
} from '../constants'

interface PushCommit {
  id: string
  message: string
}

interface PushPayload {
  ref: string
  commits?: PushCommit[]
  repository?: {
    full_name?: string
  }
}

export async function handleGithubPush(payload: PushPayload) {
  const githubRepo = payload.repository?.full_name?.trim()
  const branch = parseBranchFromRef(payload.ref)
  const commits = payload.commits ?? []

  if (!githubRepo || !branch || commits.length === 0) {
    return
  }

  const db = getFirestore()
  const projectSnap = await db
    .collection(PROJECTS_COLLECTION)
    .where('githubRepo', '==', githubRepo)
    .limit(1)
    .get()

  if (projectSnap.empty) {
    return
  }

  const projectDoc = projectSnap.docs[0]
  const taskSnap = await db
    .collection(TASKS_COLLECTION)
    .where('projectId', '==', projectDoc.id)
    .where('githubBranch', '==', branch)
    .limit(1)
    .get()

  if (taskSnap.empty) {
    return
  }

  const taskDoc = taskSnap.docs[0]
  const batch = db.batch()
  const now = FieldValue.serverTimestamp()

  for (const commit of commits) {
    const message = commit.message.trim()
    if (!message) continue

    const updateRef = taskDoc.ref.collection(TASK_UPDATES_SUBCOLLECTION).doc()
    batch.set(updateRef, {
      text: message,
      createdBy: getGithubSystemUid(),
      isFromGithub: true,
      statusChange: null,
      imageUrl: null,
      fileUrl: null,
      fileName: null,
      createdAt: now,
    })
  }

  batch.update(taskDoc.ref, { updatedAt: now })
  batch.update(projectDoc.ref, { updatedAt: now })

  await batch.commit()
}

function parseBranchFromRef(ref: string): string | null {
  const prefix = 'refs/heads/'
  if (!ref.startsWith(prefix)) return null
  const branch = ref.slice(prefix.length).trim()
  return branch.length > 0 ? branch : null
}
