import { onRequest } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getGithubWebhookSecret } from './constants'
import { verifyGithubSignature } from './github/verifySignature'
import { handleGithubPush } from './github/handlePush'

initializeApp()

export const githubWebhook = onRequest(
  {
    cors: false,
    invoker: 'public',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed')
      return
    }

    const event = req.get('X-GitHub-Event')
    if (event !== 'push') {
      res.status(200).send('Ignored')
      return
    }

    const rawBody = req.rawBody.toString('utf8')
    const signature = req.get('X-Hub-Signature-256')

    if (!verifyGithubSignature(rawBody, signature, getGithubWebhookSecret())) {
      res.status(401).send('Invalid signature')
      return
    }

    try {
      const payload = JSON.parse(rawBody) as Parameters<typeof handleGithubPush>[0]
      await handleGithubPush(payload)
      res.status(200).send('OK')
    } catch (error) {
      console.error('GitHub webhook failed:', error)
      res.status(500).send('Internal Server Error')
    }
  },
)
