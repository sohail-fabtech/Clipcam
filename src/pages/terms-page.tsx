import { IconBack } from '../components/icons'

/** Plain-language terms of use for on-device Clipcam. */
export function TermsPage() {
  return () => (
    <div className="screen about-screen">
      <div className="about-top">
        <a href="/" className="btn-icon" aria-label="Back to projects">
          <IconBack />
        </a>
        <strong>Terms</strong>
        <span className="about-top-spacer" aria-hidden="true" />
      </div>

      <div className="about-body">
        <h1>Terms</h1>
        <p className="legal-updated">Last updated: October 2026</p>

        <section className="about-section">
          <h2>Free to use, as is</h2>
          <p>
            Clipcam is free to use — every feature, with no subscription, purchase, or watermark —
            and runs entirely on your device. It is provided &ldquo;as
            is&rdquo; without warranty of any kind. Use it at your own risk — always keep copies of
            recordings you care about. Device storage can be cleared by the browser or OS.
          </p>
        </section>

        <section className="about-section">
          <h2>Your recordings are yours</h2>
          <p>
            You own your recordings entirely. The app claims no rights to any of your content.
          </p>
        </section>

        <section className="about-section">
          <h2>Recording responsibly</h2>
          <p>
            Don&rsquo;t use the app to record people unlawfully. You are responsible for complying
            with local recording and consent laws.
          </p>
        </section>

        <section className="about-section">
          <h2>Liability</h2>
          <p>
            Clipcam is free, and to the extent the law allows, its authors are not liable for any
            loss arising from its use.
          </p>
        </section>

        <section className="about-section">
          <h2>Changes &amp; affiliation</h2>
          <p>
            These terms may change with the app; they&rsquo;re versioned with its open-source code.
            Questions:{' '}
            <a href="https://me.jscrate.dev" target="_blank" rel="noreferrer noopener">
              me.jscrate.dev
            </a>
            . Clipcam is not affiliated with OK Video.
          </p>
        </section>

        <section className="about-section legal-nav">
          <p>
            See also the <a href="/privacy">Privacy</a> and <a href="/about">About</a> pages.
          </p>
        </section>
      </div>
    </div>
  )
}
