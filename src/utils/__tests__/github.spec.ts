import { describe, it, expect } from 'vitest'
import {
  formatGithubRepoUrl,
  parseGithubRepoInput,
  GITHUB_REPO_INVALID_MESSAGE,
} from '@/utils/github'

describe('parseGithubRepoInput', () => {
  it('returnerer null for tom input', () => {
    expect(parseGithubRepoInput('')).toEqual({ value: null, error: null })
    expect(parseGithubRepoInput('   ')).toEqual({ value: null, error: null })
  })

  it('parser full GitHub URL', () => {
    expect(parseGithubRepoInput('https://github.com/store-filer-as/kundeportal')).toEqual({
      value: 'store-filer-as/kundeportal',
      error: null,
    })
  })

  it('parser URL uten https og med trailing slash', () => {
    expect(parseGithubRepoInput('github.com/store-filer-as/kundeportal/')).toEqual({
      value: 'store-filer-as/kundeportal',
      error: null,
    })
  })

  it('parser kort owner/repo-format', () => {
    expect(parseGithubRepoInput('store-filer-as/kundeportal')).toEqual({
      value: 'store-filer-as/kundeportal',
      error: null,
    })
  })

  it('returnerer feil for ugyldig input', () => {
    expect(parseGithubRepoInput('ikke-en-url')).toEqual({
      value: null,
      error: GITHUB_REPO_INVALID_MESSAGE,
    })
  })
})

describe('formatGithubRepoUrl', () => {
  it('bygger GitHub URL fra owner/repo', () => {
    expect(formatGithubRepoUrl('store-filer-as/kundeportal')).toBe(
      'https://github.com/store-filer-as/kundeportal',
    )
  })
})
