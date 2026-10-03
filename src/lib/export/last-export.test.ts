import { describe, expect, it } from 'vitest'
import type { ClipRecord } from '../types'
import { exportSignature } from './last-export'

function fakeClip(id: string): ClipRecord {
  return {
    id,
    projectId: 'proj_x',
    blob: new Blob(['clip'], { type: 'video/mp4' }),
    mimeType: 'video/mp4',
    durationMs: 1500,
    trimStartMs: 0,
    trimEndMs: 1500,
    createdAt: 1700000000000,
  }
}

describe('exportSignature', () => {
  it('signs absent and portrait orientations identically', () => {
    const clips = [fakeClip('clip_a')]
    expect(exportSignature(clips, null, 'portrait')).toBe(
      exportSignature(clips, null),
    )
    expect(exportSignature(clips, null, undefined)).toBe(
      exportSignature(clips, null),
    )
    expect(JSON.parse(exportSignature(clips, null, 'portrait')).orientation).toBe(
      'portrait',
    )
  })

  it('signs landscape differently so the cached export re-renders', () => {
    const clips = [fakeClip('clip_a')]
    expect(exportSignature(clips, null, 'landscape')).not.toBe(
      exportSignature(clips, null, 'portrait'),
    )
  })

  it('signs location inclusion differently so a cached geotag is never reused', () => {
    const clips = [fakeClip('clip_a')]
    expect(exportSignature(clips, null, 'portrait', true)).not.toBe(
      exportSignature(clips, null, 'portrait', false),
    )
  })

  it('signs the project title so a rename cannot reuse the old file metadata', () => {
    const clips = [fakeClip('clip_a')]
    expect(exportSignature(clips, null, 'portrait', false, 'Beach day')).not.toBe(
      exportSignature(clips, null, 'portrait', false, 'Road trip'),
    )
  })

  it('signs letterbox so a fit change cannot reuse a cropped export', () => {
    const cropped = [fakeClip('clip_a')]
    const letterboxed = [{ ...fakeClip('clip_a'), fit: 'letterbox' as const }]
    expect(exportSignature(letterboxed, null, 'portrait')).not.toBe(
      exportSignature(cropped, null, 'portrait'),
    )
  })
})
