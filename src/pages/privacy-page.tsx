import { IconBack } from '../components/icons'

/** Plain-language privacy policy for on-device Clipcam. */
export function PrivacyPage() {
  return () => (
    <div className="screen about-screen">
      <div className="about-top">
        <a href="/" className="btn-icon" aria-label="Back to projects">
          <IconBack />
        </a>
        <strong>Privacy</strong>
        <span className="about-top-spacer" aria-hidden="true" />
      </div>

      <div className="about-body">
        <h1>Privacy</h1>
        <p className="legal-updated">Last updated: October 2026</p>

        <section className="about-section">
          <h2>Everything stays on your device</h2>
          <p>
            All recordings, projects, and edits live in this browser&rsquo;s on-device storage
            (IndexedDB). Nothing is uploaded. There are no accounts, no cookies, and no cross-site
            tracking.
          </p>
        </section>

        <section className="about-section">
          <h2>No analytics, no crash reports</h2>
          <p>
            Clipcam runs no analytics and sends no crash reports. The only data the app ever sends
            on its own is a short-lived matchmaking room, and only when you tap Send to device.
          </p>
        </section>

        <section className="about-section">
          <h2>Recording health reports</h2>
          <p>
            To catch choppy recordings, each take keeps a small report on this device: frame
            timings and counters read from the saved file (frame rate, missing frames, gaps),
            how busy the app was while recording, encoder and save timings, and coarse device
            facts (browser and OS names, CPU cores, memory size, battery level, camera
            resolution). Reports never contain video, audio, location, or project names. They
            stay on the device unless you share them yourself from About → Recording health.
            Clear them there anytime.
          </p>
        </section>

        <section className="about-section">
          <h2>Send to another device</h2>
          <p>
            Clipcam can send a project to another phone or computer that has the app open. A
            Cloudflare matchmaker introduces the two browsers (a short code plus the WebRTC
            connection description, which includes network addresses). Your clips never go to our
            servers — they travel device-to-device, encrypted. Rooms expire in minutes and are not
            stored as a library. If the devices cannot connect (different networks, strict Wi‑Fi),
            use Save backup and import instead. Receiving a project is free and is the same as
            importing a backup.
          </p>
        </section>

        <section className="about-section">
          <h2>Camera &amp; microphone</h2>
          <p>
            The camera and microphone are used only while the app is open, on the camera view.
            On most devices the microphone is held only while you record; on iOS it stays with
            the camera preview (a WebKit requirement for working audio). Backgrounding the app
            releases both. Nothing is ever streamed anywhere.
          </p>
        </section>

        <section className="about-section">
          <h2>Optional location tagging</h2>
          <p>
            Location tagging is optional and off by default. You can
            opt in with a button, which asks the browser for permission. When it&rsquo;s on, each
            new clip stores device coordinates locally. Exported videos omit location by default;
            you can explicitly include it in MP4 metadata and chapter titles from the export
            sheet. Leaving that export option off is treated as a public share: the file will not
            include automatically captured coordinates, filming dates, or chapter-coordinate
            metadata. You can turn location tagging off anytime; existing clips keep whatever they
            already captured, and deleting a clip deletes its location data with it.
          </p>
        </section>

        <section className="about-section">
          <h2>Exports &amp; sharing</h2>
          <p>
            Exported or shared files leave the device only when you share or save them yourself.
            MP4 exports always include the project title you chose, credit Clipcam, and note how
            many clips (and photos, and
            whether there is music) made the film. The title is whatever you named the project — it
            can identify a person, place, or event if you put that in the name. Automatically
            captured coordinates, filming dates inside the MP4, and chapter coordinates stay out
            of the file unless you turn on the option to include clip locations. Share and
            Save still stamp the file&rsquo;s last-modified time from the last clip so photo
            libraries (including Synology Photos) can sort by when you filmed.
          </p>
        </section>

        <section className="about-section">
          <h2>Deleting your data</h2>
          <p>
            Delete projects in the app, or clear this site&rsquo;s browsing data / uninstall the
            PWA. There is no server copy to delete.
          </p>
        </section>

        <section className="about-section">
          <h2>Questions</h2>
          <p>
            Reach Sohail Khan at{' '}
            <a href="https://me.jscrate.dev" target="_blank" rel="noreferrer noopener">
              me.jscrate.dev
            </a>
            .
          </p>
        </section>

        <section className="about-section legal-nav">
          <p>
            See also the <a href="/terms">Terms</a> and <a href="/about">About</a> pages.
          </p>
        </section>
      </div>
    </div>
  )
}
