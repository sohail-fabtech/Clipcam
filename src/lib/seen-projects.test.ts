import { describe, expect, it } from 'vitest'
import { projectChange } from './seen-projects'

const project = (id: string, updatedAt: number) => ({ id, createdAt: 0, updatedAt })

describe('projectChange', () => {
  it('lights nothing before any project has been opened (first run)', () => {
    expect(projectChange(project('a', 10), {})).toBeNull()
  })

  it('lights an unseen project as new once the board is tracking', () => {
    expect(projectChange(project('b', 10), { a: 5 })).toBe('new')
  })

  it('lights a project changed after it was last opened, and clears when seen', () => {
    expect(projectChange(project('a', 10), { a: 5 })).toBe('updated')
    expect(projectChange(project('a', 10), { a: 10 })).toBeNull()
  })
})
