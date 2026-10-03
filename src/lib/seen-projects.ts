/**
 * The home board's "held change": a project stays lit (NEW / UPDATED) from
 * the moment it changes until it is opened from home. Per-device and purely
 * cosmetic, so storage failures just mean nothing is lit.
 */
const KEY = 'clipcam:seen-projects'

type SeenMap = Record<string, number>

function readSeen(): SeenMap {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? (parsed as SeenMap) : {}
  } catch {
    return {}
  }
}

export type ProjectChange = 'new' | 'updated' | null

/** What the board should light for this project, if anything. */
export function projectChange(
  project: { id: string; createdAt: number; updatedAt: number },
  seen: SeenMap = readSeen(),
): ProjectChange {
  const seenAt = seen[project.id]
  // Projects that predate this feature have no record — never light them
  // just because the map is empty on first run.
  if (seenAt === undefined) return Object.keys(seen).length === 0 ? null : 'new'
  return project.updatedAt > seenAt ? 'updated' : null
}

/** Opening a project from home acknowledges whatever was lit. */
export function markProjectSeen(id: string, at: number = Date.now()): void {
  try {
    const seen = readSeen()
    seen[id] = at
    localStorage.setItem(KEY, JSON.stringify(seen))
  } catch {
    // Private mode without storage — the tag just stays.
  }
}
