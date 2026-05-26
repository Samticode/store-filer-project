const GITHUB_REPO_URL_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+?)\/?(?:\.git)?(?:\/.*)?$/i

const GITHUB_REPO_SHORT_PATTERN = /^([^/]+)\/([^/]+)$/

export const GITHUB_UPDATE_LABEL = 'GitHub'

export const GITHUB_COMMIT_UPDATE_TEXT = 'Commit pushet'

export const GITHUB_REPO_INVALID_MESSAGE =
  'Ugyldig GitHub repo. Bruk f.eks. https://github.com/eier/repo'

export function parseGithubRepoInput(input: string): {
  value: string | null
  error: string | null
} {
  const trimmed = input.trim()
  if (!trimmed) {
    return { value: null, error: null }
  }

  const urlMatch = trimmed.match(GITHUB_REPO_URL_PATTERN)
  if (urlMatch?.[1] && urlMatch[2]) {
    return { value: `${urlMatch[1]}/${urlMatch[2]}`, error: null }
  }

  const shortMatch = trimmed.match(GITHUB_REPO_SHORT_PATTERN)
  if (shortMatch?.[1] && shortMatch[2]) {
    return { value: `${shortMatch[1]}/${shortMatch[2]}`, error: null }
  }

  return { value: null, error: GITHUB_REPO_INVALID_MESSAGE }
}

export function formatGithubRepoUrl(githubRepo: string): string {
  return `https://github.com/${githubRepo}`
}
