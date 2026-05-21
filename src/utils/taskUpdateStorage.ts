import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { firebaseStorage } from '@/firebase'
import { TASKS_COLLECTION, TASK_UPDATES_SUBCOLLECTION } from '@/types'

function taskUpdateStoragePath(taskId: string, updateId: string, kind: 'image' | 'file', fileName: string) {
  return `${TASKS_COLLECTION}/${taskId}/${TASK_UPDATES_SUBCOLLECTION}/${updateId}/${kind}/${fileName}`
}

async function uploadToStorage(path: string, file: File) {
  const storageRef = ref(firebaseStorage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function uploadTaskUpdateImage(taskId: string, updateId: string, file: File) {
  return uploadToStorage(taskUpdateStoragePath(taskId, updateId, 'image', file.name), file)
}

export async function uploadTaskUpdateFile(taskId: string, updateId: string, file: File) {
  return uploadToStorage(taskUpdateStoragePath(taskId, updateId, 'file', file.name), file)
}
