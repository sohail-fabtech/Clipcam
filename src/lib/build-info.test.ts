import { describe, expect, it } from 'vitest'
import { COMMIT_SHA, shortVersion } from './build-info'

describe('build-info', () => {
  it('exposes a short version label', () => {
    expect(shortVersion()).toBe(COMMIT_SHA === 'dev' ? 'dev' : COMMIT_SHA.slice(0, 7))
  })
})
