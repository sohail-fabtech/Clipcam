import type { Handle } from 'remix/component'
import { on } from 'remix/component'
import { IconBack } from '../components/icons'
import { BrandMark } from '../components/brand-mark'
import { RecordingHealthPanel } from '../components/recording-health-panel'
import { VideoQualityPicker } from '../components/video-quality-picker'
import {
  checkForUpdates,
  fetchDeployedVersion,
  getUpdateDiagnostics,
  isRunningStale,
  reconcileUpdateCheckResult,
  type UpdateDiagEvent,
} from '../lib/app-update'
import { buildDateLabel, COMMIT_SHA, shortVersion } from '../lib/build-info'
import { reportError } from '../lib/error-reporting'
import { clearExportCache, estimateExportCacheBytes } from '../lib/export/export-cache'
import { listRearCameras } from '../lib/media'
import {
  BackupCopyError,
  BackupFormatError,
  importKodyVideoBackupFile,
} from '../lib/project-transfer'
import {
  availableBytes,
  estimateStorageSpace,
  formatBytes,
  isOtherStorageNotable,
  storageBreakdown,
  type StorageSpace,
} from '../lib/storage-space'
import {
  getSettings,
  listProjects,
  measureStorage,
  ProjectLimitError,
  reclaimOrphanedStorage,
  setVideoQuality,
  StorageQuotaExceededError,
} from '../lib/storage'
import { resolveVideoQuality, type VideoQualityPreset } from '../lib/video-quality'
import { navigate } from '../router'

/** Device context to paste into a bug report. */
function deviceReport(): string {
  return [
    `- App URL: ${location.origin}`,
    `- User agent: ${navigator.userAgent}`,
    `- Screen: ${window.screen.width}×${window.screen.height} @${window.devicePixelRatio}x`,
    `- Installed as app: ${window.matchMedia('(display-mode: standalone)').matches ? 'yes' : 'no'}`,
  ].join('\n')
}

function shortSha(sha: string | null): string {
  if (!sha) return 'unknown'
  return sha === 'dev' ? 'dev' : sha.slice(0, 7)
}

function formatDiagEvent(event: UpdateDiagEvent): string {
  const time = new Date(event.at).toLocaleTimeString()
  const bits = [time, event.phase]
  if (event.reason) bits.push(event.reason)
  if (event.claimed !== undefined) bits.push(event.claimed ? 'claimed' : 'no-claim')
  return bits.join(' · ')
}

function updateDiagnosticsReport(
  deployedCommit: string | null,
  deployedKnown: boolean,
): string | null {
  const diag = getUpdateDiagnostics()
  const stale = isRunningStale(deployedCommit ? { commit: deployedCommit } : null)
  const activeWorker = diag.waiting || diag.installing
  if (!stale && diag.events.length === 0 && !activeWorker) return null
  if (!deployedKnown && diag.events.length === 0 && !activeWorker) return null
  return [
    `Running: ${shortSha(COMMIT_SHA)}`,
    `Deployed: ${shortSha(deployedCommit)}`,
    `Controller: ${diag.hasController ? 'yes' : 'no'}`,
    `Waiting worker: ${diag.waiting ? 'yes' : 'no'}`,
    `Installing worker: ${diag.installing ? 'yes' : 'no'}`,
    ...diag.events.map(formatDiagEvent),
  ].join('\n')
}

interface AboutData {
  storage: StorageSpace | null
  exportCacheBytes: number
  /** Largest first. */
  projectSizes: Array<{ id: string; name: string; bytes: number }>
  orphanBytes: number
  videoQuality: VideoQualityPreset
}

/** Last loaded About settings, kept across mounts so quality does not
 * flash the default when navigating back. */
let lastAboutData: AboutData | null = null

async function loadAboutData(): Promise<AboutData> {
  const [storage, exportCacheBytes, settings, scan, projects] = await Promise.all([
    estimateStorageSpace(),
    estimateExportCacheBytes(),
    getSettings(),
    measureStorage(),
    listProjects(),
  ])
  return {
    storage,
    exportCacheBytes,
    projectSizes: projects
      .map((project) => ({
        id: project.id,
        name: project.name,
        bytes: scan.projectBytes.get(project.id) ?? 0,
      }))
      .sort((a, b) => b.bytes - a.bytes),
    orphanBytes: scan.orphans.bytes,
    videoQuality: resolveVideoQuality(settings.videoQuality),
  }
}

type UpdateStatus = 'idle' | 'checking' | 'current' | 'updating' | 'downloading' | 'unavailable'

const UPDATE_STATUS_LABEL: Record<Exclude<UpdateStatus, 'idle'>, string> = {
  checking: 'Checking…',
  current: "You're on the latest version.",
  updating: 'Update found — reloading…',
  downloading: 'Update found — still downloading. It will offer itself when ready.',
  unavailable: "Couldn't check right now (offline, or not running from a deployment).",
}

/** Credits, inspiration, and the open-source pointer. */
export function AboutPage(handle: Handle) {
  let data: AboutData = lastAboutData ?? {
    storage: null,
    exportCacheBytes: 0,
    projectSizes: [],
    orphanBytes: 0,
    videoQuality: 'high',
  }
  let updateStatus: UpdateStatus = 'idle'
  let cacheStatus: string | null = null
  let clearingCache = false
  let reclaiming = false
  let cameraReport: string | null = null
  let inspectingCameras = false
  let importing = false
  let importProgress: string | null = null
  let importError: string | null = null
  let deployedCommit: string | null = null
  let deployedKnown = false

  /** Same stale-load guard as home: an in-flight refresh must not overwrite
   * a quality pick that landed while settings were still loading. */
  let refreshVersion = 0
  const refresh = () => {
    const version = ++refreshVersion
    void loadAboutData()
      .then((loaded) => {
        if (handle.signal.aborted || version !== refreshVersion) return
        lastAboutData = loaded
        data = loaded
        void handle.update()
      })
      .catch((err) => {
        if (handle.signal.aborted || version !== refreshVersion) return
        reportError(err, 'load-about')
      })
  }
  refresh()
  let hashScrolled = false
  void fetchDeployedVersion().then((deployed) => {
    if (handle.signal.aborted) return
    deployedCommit = deployed?.commit ?? null
    deployedKnown = true
    void handle.update()
  })

  /**
   * On-device camera diagnostic: what the browser exposes varies wildly by
   * phone and Chrome build (labels, facingMode capability, zoom ranges),
   * and remote bug reports about lenses are unresolvable without it.
   */
  const onInspectCameras = async () => {
    if (inspectingCameras) return
    inspectingCameras = true
    void handle.update()
    let probe: MediaStream | null = null
    try {
      probe = await navigator.mediaDevices.getUserMedia({ video: true })
      const track = probe.getVideoTracks()[0]
      const caps = track?.getCapabilities?.() as
        | (MediaTrackCapabilities & { zoom?: { min?: number; max?: number } })
        | undefined
      const lines: string[] = [`Active camera: ${track?.label || '(no label)'}`]
      if (caps?.zoom && typeof caps.zoom.min === 'number') {
        lines.push(`Active zoom range: ${caps.zoom.min}–${caps.zoom.max}×`)
      } else {
        lines.push('Active zoom range: not exposed')
      }
      const rear = await listRearCameras()
      lines.push(`Detected rear lenses: ${rear.length}`)
      const devices = await navigator.mediaDevices.enumerateDevices()
      for (const device of devices) {
        if (device.kind !== 'videoinput') continue
        const facing = (
          device as MediaDeviceInfo & { getCapabilities?: () => MediaTrackCapabilities }
        ).getCapabilities?.()?.facingMode
        const facingLabel =
          Array.isArray(facing) && facing.length > 0 ? ` [${facing.join(', ')}]` : ''
        const rearMark = rear.includes(device.deviceId) ? ' — rear' : ''
        lines.push(`• ${device.label || '(no label)'}${facingLabel}${rearMark}`)
      }
      cameraReport = lines.join('\n')
    } catch (err) {
      cameraReport =
        err instanceof Error ? `Could not inspect: ${err.message}` : 'Could not inspect cameras.'
    } finally {
      probe?.getTracks().forEach((track) => {
        track.stop()
      })
      inspectingCameras = false
      void handle.update()
    }
  }

  const onClearExportCache = () => {
    if (clearingCache) return
    clearingCache = true
    void handle.update()
    void clearExportCache()
      .then((freedBytes) => {
        cacheStatus = `Freed ${formatBytes(freedBytes)}.`
        void refresh()
      })
      .catch((err) => {
        reportError(err, 'clear-export-cache')
        cacheStatus =
          err instanceof Error ? err.message : 'Could not clear cached exports — try again.'
      })
      .finally(() => {
        clearingCache = false
        void handle.update()
      })
  }

  const onReclaimOrphans = () => {
    if (reclaiming) return
    reclaiming = true
    void handle.update()
    void reclaimOrphanedStorage()
      .then((freedBytes) => {
        cacheStatus = `Cleaned up leftovers — freed ${formatBytes(freedBytes)}.`
        void refresh()
      })
      .catch((err) => {
        reportError(err, 'reclaim-orphans')
        cacheStatus = err instanceof Error ? err.message : 'Could not clean up — try again.'
      })
      .finally(() => {
        reclaiming = false
        void handle.update()
      })
  }

  const importBackup = (file: File) => {
    void (async () => {
      importing = true
      importError = null
      importProgress = 'Reading backup…'
      void handle.update()
      try {
        const project = await importKodyVideoBackupFile(file, (done, total) => {
          importProgress = `Importing clip ${Math.min(done + 1, total)} of ${total}…`
          void handle.update()
        })
        // Land directly in the imported project — unambiguous success.
        navigate(`/project/${project.id}`)
      } catch (err) {
        // Wrong/damaged file, plan cap, or a full disk = expected guidance.
        if (
          !(err instanceof BackupFormatError) &&
          !(err instanceof BackupCopyError) &&
          !(err instanceof StorageQuotaExceededError) &&
          !(err instanceof ProjectLimitError)
        ) {
          reportError(err, 'import')
        }
        importError = err instanceof Error ? err.message : 'Could not import that file'
      } finally {
        importProgress = null
        importing = false
        void handle.update()
      }
    })()
  }

  const onCheckForUpdates = () => {
    if (updateStatus === 'checking' || updateStatus === 'updating') return
    updateStatus = 'checking'
    void handle.update()
    void checkForUpdates()
      .then((result) => {
        const resolved = reconcileUpdateCheckResult(
          result,
          deployedCommit ? { commit: deployedCommit } : null,
        )
        switch (resolved) {
          case 'updated':
            // checkForUpdates already applied it; the page is about to reload.
            updateStatus = 'updating'
            return
          case 'current':
            updateStatus = 'current'
            return
          case 'downloading':
            updateStatus = 'downloading'
            return
          case 'unavailable':
            updateStatus = 'unavailable'
            return
          default: {
            const exhaustive: never = resolved
            throw new Error(`Unhandled update result: ${String(exhaustive)}`)
          }
        }
      })
      .catch(() => {
        updateStatus = 'unavailable'
      })
      .finally(() => void handle.update())
  }

  return () => {
    const { storage, exportCacheBytes, projectSizes, orphanBytes, videoQuality } = data
    const breakdown = storage
      ? storageBreakdown(storage, {
          projectsBytes: projectSizes.reduce((sum, project) => sum + project.bytes, 0),
          exportCacheBytes,
          orphanBytes,
        })
      : null
    const hashTarget = location.hash.slice(1)
    if (
      !hashScrolled &&
      (hashTarget === 'video-quality' || hashTarget === 'recording-health' || hashTarget === 'storage')
    ) {
      hashScrolled = true
      queueMicrotask(() => {
        const section = document.getElementById(hashTarget)
        const scroller = document.querySelector('.about-screen .about-body')
        if (section && scroller instanceof HTMLElement) {
          const top =
            section.getBoundingClientRect().top -
            scroller.getBoundingClientRect().top +
            scroller.scrollTop
          scroller.scrollTo({ top: Math.max(0, top - 8) })
        }
        window.scrollTo(0, 0)
      })
    }
    const version = <code>{shortVersion()}</code>
    const diagReport = updateDiagnosticsReport(deployedCommit, deployedKnown)
    return (
      <div className="screen about-screen">
        <div className="about-top">
          <a href="/" className="btn-icon" aria-label="Back to projects">
            <IconBack />
          </a>
          <strong>About</strong>
          <span className="about-top-spacer" aria-hidden="true" />
        </div>

        <div className="about-body">
          <div className="about-hero" aria-hidden="true">
            <BrandMark size={96} className="brand-hero-art" variant="icon" />
          </div>
          <h1>Clipcam</h1>

          <section className="about-section">
            <h2>Free &amp; open source</h2>
            <p>
              Every feature is free — six projects, 1080p, music, landscape, location, and Send to
              device — with no subscription, no purchase, and no watermark on your videos. Clipcam
              is open source and made by Sohail Khan (
              <a href="https://me.jscrate.dev" target="_blank" rel="noreferrer noopener">
                me.jscrate.dev
              </a>
              ).
            </p>
          </section>

          <section className="about-section">
            <h2>Credits</h2>
            <p>
              Clipcam is built on{' '}
              <a
                href="https://github.com/kentcdodds/kody-video"
                target="_blank"
                rel="noreferrer noopener"
              >
                Kody Video
              </a>{' '}
              by Kent C. Dodds. Its hold-to-record interaction model is inspired by{' '}
              <a href="https://okvideo.app" target="_blank" rel="noreferrer noopener">
                OK Video
              </a>{' '}
              by Pim Coumans — a wonderful clips camera for iPhone. Clipcam is an independent
              project and is not affiliated with either.
            </p>
          </section>

          <section className="about-section">
            <h2>Private by design</h2>
            <p>
              No accounts, no uploads, no analytics, no tracking. Clips live in this browser&rsquo;s
              storage until you export and share them yourself. The app&rsquo;s only own network
              traffic is a short-lived matchmaking room so two browsers can find each other — and
              only when you tap Send to device. Clips never upload.
            </p>
          </section>

          <section className="about-section">
            <h2>Made for phones</h2>
            <p>
              Clipcam is designed as a mobile camera app — install it on your phone for the real
              experience. It works on desktop too, with keyboard support: hold <kbd>Space</kbd> to
              record, <kbd>F</kbd> flips the camera, <kbd>T</kbd> starts the self-timer,{' '}
              <kbd>E</kbd> opens the editor, <kbd>P</kbd> plays your cut, and <kbd>Delete</kbd>{' '}
              removes the last clip. In the editor the arrow keys select clips,{' '}
              <kbd>Alt</kbd>+arrows reorder, <kbd>T</kbd> trims, <kbd>D</kbd> duplicates,{' '}
              <kbd>Delete</kbd> deletes, and <kbd>Esc</kbd> goes back. During playback the arrows
              skip clips, <kbd>Space</kbd> pauses, and <kbd>Esc</kbd> closes.
            </p>
          </section>

          <section className="about-section" id="video-quality">
            <h2>Video quality</h2>
            <p>
              New clips only — already-recorded takes stay as they are. Every option stays at 30
              frames a second so recording does not drop frames or get janky. New clips record at
              High (1080p) unless you pick a smaller size.
            </p>
            <VideoQualityPicker
              value={videoQuality}
              onChange={(next) => {
                data = { ...data, videoQuality: next }
                lastAboutData = data
                const pickVersion = ++refreshVersion
                void handle.update()
                void setVideoQuality(next).catch((err) => {
                  reportError(err, 'video-quality')
                  if (refreshVersion === pickVersion) refresh()
                })
              }}
            />
          </section>

          <section className="about-section" id="storage">
            <h2>Storage</h2>
            <p>
              {storage
                ? `This app uses ${formatBytes(storage.usedBytes)} of the ${formatBytes(storage.quotaBytes)} the browser allows. `
                : ''}
              Your recordings are the big consumer — delete old projects from the home screen
              (⋯ → Delete) to free the most space, or record new clips at a lower video quality
              above. The app also keeps your latest export cached so tapping Go on an unchanged
              project is instant.
            </p>
            <ul className="storage-breakdown" aria-label="What is using space">
              {projectSizes.map((project) => (
                <li key={project.id}>
                  <span>{project.name}</span>
                  <strong>{formatBytes(project.bytes)}</strong>
                </li>
              ))}
              <li>
                <span>
                  Cached export files
                  {exportCacheBytes > 0 ? (
                    <>
                      {' · '}
                      <button
                        type="button"
                        className="link-button"
                        disabled={clearingCache}
                        mix={on('click', onClearExportCache)}
                      >
                        Clear
                      </button>
                    </>
                  ) : null}
                </span>
                <strong>{formatBytes(exportCacheBytes)}</strong>
              </li>
              {orphanBytes > 0 ? (
                <li>
                  <span>
                    Leftovers no project uses
                    {' · '}
                    <button
                      type="button"
                      className="link-button"
                      disabled={reclaiming}
                      mix={on('click', onReclaimOrphans)}
                    >
                      Clean up
                    </button>
                  </span>
                  <strong>{formatBytes(orphanBytes)}</strong>
                </li>
              ) : null}
              {breakdown ? (
                <li>
                  <span>App files &amp; space not yet released</span>
                  <strong>{formatBytes(breakdown.otherBytes)}</strong>
                </li>
              ) : null}
            </ul>
            {storage && breakdown && isOtherStorageNotable(breakdown, storage) ? (
              <p className="storage-other-note">
                About {formatBytes(breakdown.otherBytes)} isn&rsquo;t part of any project. That is
                usually space the browser hasn&rsquo;t released yet from earlier recordings and
                clip edits &mdash; it frees it once Clipcam fully closes. Close the app
                completely (swipe it away, and close the browser if it stays open), then reopen it.
              </p>
            ) : null}
            {cacheStatus ? (
              <p role="status" aria-live="polite">
                {cacheStatus}
              </p>
            ) : null}
          </section>

          <section className="about-section">
            <h2>Backups</h2>
            <p>
              Every project can be saved as a single <code>.clipcam</code> file (⋯ →{' '}
              <strong>Save backup</strong> on the home screen) — a safety net, and the way to move
              a project between devices. You can also <strong>Send to device</strong> over the
              local network (the other device opens{' '}
              <a href="/receive">/receive</a>). Restore a backup here (older{' '}
              <code>.kodyvideo</code> files work too), or drop the file
              anywhere in the app:
            </p>
            <div className="about-import-row">
              <label className={`btn btn-ghost about-import${importing ? ' is-disabled' : ''}`}>
                Import a backup
                <input
                  type="file"
                  accept=".clipcam,.kodyvideo,application/octet-stream"
                  className="visually-hidden"
                  disabled={importing}
                  mix={on('change', (event) => {
                    const input = event.currentTarget as HTMLInputElement
                    const file = input.files?.[0]
                    input.value = ''
                    if (file) importBackup(file)
                  })}
                />
              </label>
              {storage ? (
                <p className="about-import-space">
                  {formatBytes(availableBytes(storage))} available
                </p>
              ) : null}
            </div>
            {importProgress ? (
              <p role="status" aria-live="polite">
                {importProgress} Keep this tab open.
              </p>
            ) : null}
            {importError ? <div className="error-banner">{importError}</div> : null}
          </section>

          <section className="about-section">
            <h2>Cameras</h2>
            <p>
              Wondering why a lens or zoom level isn&rsquo;t available? Browsers expose cameras
              very differently across phones —{' '}
              <button
                type="button"
                className="link-button"
                disabled={inspectingCameras}
                mix={on('click', () => void onInspectCameras())}
              >
                {inspectingCameras ? 'Inspecting…' : 'Inspect cameras'}
              </button>{' '}
              shows exactly what this browser reports (nothing is sent anywhere — attach it to a
              bug report if something looks wrong).
            </p>
            {cameraReport ? <pre className="camera-report">{cameraReport}</pre> : null}
          </section>

          <RecordingHealthPanel />

          <section className="about-section">
            <h2>Support</h2>
            <p>
              Hit a bug or have an idea? Reach Sohail Khan at{' '}
              <a href="https://me.jscrate.dev" target="_blank" rel="noreferrer noopener">
                me.jscrate.dev
              </a>{' '}
              and paste these device details so the problem is easy to reproduce:
            </p>
            <pre className="camera-report device-report">{deviceReport()}</pre>
          </section>

          <section className="about-section">
            <h2>Version</h2>
            <p>
              {version}{' '}
              · built {buildDateLabel()}
              {' · '}
              <button
                type="button"
                className="link-button"
                disabled={updateStatus === 'checking' || updateStatus === 'updating'}
                mix={on('click', onCheckForUpdates)}
              >
                Check for updates
              </button>
            </p>
            {updateStatus !== 'idle' ? (
              <p role="status" aria-live="polite">
                {UPDATE_STATUS_LABEL[updateStatus]}
              </p>
            ) : null}
            {deployedKnown && isRunningStale(deployedCommit ? { commit: deployedCommit } : null) ? (
              <p role="status" aria-live="polite">
                This screen is still on an older build than the server. Tap Check for updates.
              </p>
            ) : null}
            {diagReport ? (
              <details className="about-update-diag">
                <summary>Update details</summary>
                <pre className="camera-report">{diagReport}</pre>
              </details>
            ) : null}
          </section>

          <section className="about-section">
            <h2>Legal</h2>
            <p>
              <a href="/privacy">Privacy</a>
              {' · '}
              <a href="/terms">Terms</a>
            </p>
          </section>
        </div>
      </div>
    )
  }
}
