import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyGithubSignature(
  payload: string,
  signatureHeader: string | undefined,
  secret: string,
): boolean {
  if (!signatureHeader?.startsWith('sha256=')) {
    return false
  }

  const expected = createHmac('sha256', secret).update(payload, 'utf8').digest('hex')
  const received = signatureHeader.slice('sha256='.length)

  if (expected.length !== received.length) {
    return false
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(received))
}

export function parseBranchName(ref: string): string | null {
  const prefix = 'refs/heads/'
  if (!ref.startsWith(prefix)) {
    return null
  }

  const branch = ref.slice(prefix.length).trim()
  return branch.length > 0 ? branch : null
}
