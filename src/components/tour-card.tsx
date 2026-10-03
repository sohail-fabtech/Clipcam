import type { Handle } from 'remix/component'
import { on, ref } from 'remix/component'
import { IconChevronRight, IconClose, IconEditor, IconPlay, IconShareIos } from './icons'

interface TourCardProps {
  onDismiss: () => void
}

/** The whole flow on one pass: three stops from first clip to shared video. */
const STOPS = [
  {
    code: '01',
    title: 'Hold to record',
    body: 'Press anywhere on the camera. Release to stop — every take lands as a clip.',
    Icon: IconPlay,
  },
  {
    code: '02',
    title: 'Arrange',
    body: 'Open the timeline to trim, split, reorder, add photos and music.',
    Icon: IconEditor,
  },
  {
    code: '03',
    title: 'Tap Go',
    body: 'One video is made right on this phone. Share or Save — no watermark, nothing uploaded.',
    Icon: IconShareIos,
  },
]

/**
 * Open the tour dialog from a user gesture. Idempotent: a second tap while
 * already open must not call `showModal()` again — that throws
 * `InvalidStateError` (seen on Safari/iOS double-taps).
 */
export function openTourFromGesture(dialog: HTMLDialogElement | null): void {
  if (dialog && !dialog.open) dialog.showModal()
}

/**
 * First-timer home card: the teaser opens the tour in a native `<dialog>`
 * (top layer — the page layout underneath never reflows) with a persistent
 * dismiss on the card itself. Works offline: the tour is the app's own UI.
 */
export function TourCard(handle: Handle<TourCardProps>) {
  let dialog: HTMLDialogElement | null = null

  return () => (
    <section className="tour-card" aria-label="Clipcam tour">
      <button
        type="button"
        className="tour-card-teaser"
        mix={on('click', () => openTourFromGesture(dialog))}
      >
        <span className="tour-card-code" aria-hidden="true">
          3
          <small>stops</small>
        </span>
        <span className="tour-card-copy">
          <strong>New here? See how it works</strong>
          <span>Record, arrange, share — the whole trip in 30 seconds.</span>
        </span>
        <IconChevronRight size={20} />
      </button>
      <button
        type="button"
        className="install-hint-dismiss tour-card-dismiss"
        aria-label="Dismiss tour"
        mix={on('click', () => handle.props.onDismiss())}
      >
        <IconClose size={16} />
      </button>
      <dialog
        className="tour-dialog"
        aria-label="How Clipcam works"
        mix={[
          ref((node, signal) => {
            dialog = node as HTMLDialogElement
            signal.addEventListener('abort', () => {
              dialog = null
            })
          }),
          // The pass has its own padding box; clicks on the dialog element
          // itself can only come from the ::backdrop — tap outside to close.
          on('click', (event) => {
            if (event.target === event.currentTarget) dialog?.close()
          }),
        ]}
      >
        <div className="tour-pass">
          <header className="tour-pass-head">
            <span className="board-label">Clipcam · How it works</span>
            <button
              type="button"
              className="btn-icon tour-dialog-close"
              aria-label="Close tour"
              mix={on('click', () => dialog?.close())}
            >
              <IconClose />
            </button>
          </header>
          <ol className="tour-stops">
            {STOPS.map(({ code, title, body, Icon }) => (
              <li key={code}>
                <span className="tour-stop-code">{code}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
                <span className="tour-stop-icon" aria-hidden="true">
                  <Icon />
                </span>
              </li>
            ))}
          </ol>
          <footer className="tour-pass-foot">
            <span className="board-label">Free · On-device · Works offline</span>
            <button
              type="button"
              className="btn btn-primary"
              mix={on('click', () => dialog?.close())}
            >
              Got it
            </button>
          </footer>
        </div>
      </dialog>
    </section>
  )
}

