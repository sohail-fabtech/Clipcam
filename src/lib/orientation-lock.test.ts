import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { lockOrientationFromFirstClip } from './orientation-lock'
import { setPlatformOverridesForTests } from './platform'
import { __resetDbForTests, addClip, createProject, getProject } from './storage'

function fakeBlob(label: string): Blob {
  return new Blob([label], { type: 'video/webm' })
}

describe('lockOrientationFromFirstClip', () => {
  beforeEach(async () => {
    await __resetDbForTests()
  })

  afterEach(() => {
    setPlatformOverridesForTests({})
  })

  it('prefers how the phone is held when recording, even if pixels disagree', async () => {
    setPlatformOverridesForTests({ coarsePointer: true, viewportLandscape: false })
    const project = await createProject('Held upright')
    const clip = await addClip({
      projectId: project.id,
      blob: fakeBlob('wide-sensor'),
      mimeType: 'video/webm',
      durationMs: 800,
      width: 1920,
      height: 1080,
    })

    await lockOrientationFromFirstClip(project.id, clip, { preferHeldOrientation: true })
    expect((await getProject(project.id))?.orientation).toBeUndefined()
  })

  it('uses clip pixels for imports, ignoring how the device is held', async () => {
    setPlatformOverridesForTests({ coarsePointer: true, viewportLandscape: false })
    const project = await createProject('Import wide')
    const clip = await addClip({
      projectId: project.id,
      blob: fakeBlob('import'),
      mimeType: 'video/webm',
      durationMs: 800,
      width: 1920,
      height: 1080,
    })

    await lockOrientationFromFirstClip(project.id, clip)
    expect((await getProject(project.id))?.orientation).toBe('landscape')
  })
  it('never locks a desktop recording from landscape webcam pixels', async () => {
    setPlatformOverridesForTests({ coarsePointer: false })
    const project = await createProject('Webcam')
    const clip = await addClip({
      projectId: project.id,
      blob: fakeBlob('webcam'),
      mimeType: 'video/webm',
      durationMs: 800,
      width: 1280,
      height: 720,
    })

    await lockOrientationFromFirstClip(project.id, clip, { preferHeldOrientation: true })
    expect((await getProject(project.id))?.orientation).toBeUndefined()
  })
})
