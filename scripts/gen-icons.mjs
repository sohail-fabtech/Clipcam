/**
 * Render every raster brand asset from public/logo.svg (the single source):
 * favicon, apple-touch-icon, PWA icons (incl. a real maskable icon with the
 * art inside the 80% safe zone), and the 1200×630 social card.
 *
 * Run: npm run icons   (uses the Playwright Chromium already installed)
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))
const pub = (file) => `${root}public/${file}`
const logo = await readFile(pub('logo.svg'), 'utf8')
const INK = '#0B0D10'

/** Logo at `scale` of the canvas, on `background` (transparent keeps the
 * rounded tile's corners clear for `any`-purpose icons). */
const iconPage = (scale, background) => `<!doctype html><html><body style="margin:0;
  width:100vw;height:100vh;display:grid;place-items:center;background:${background}">
  <div style="width:${scale * 100}vmin;height:${scale * 100}vmin">${logo.replace(
    '<svg ',
    '<svg width="100%" height="100%" ',
  )}</div></body></html>`

// Inlined: setContent pages are about:blank, which cannot load file:// fonts.
const fontData = async (file) => (await readFile(pub(`fonts/${file}`))).toString('base64')
const fontFace = async (family, file, weight, extra = '') =>
  `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${await fontData(file)}) format('woff2');font-weight:${weight};${extra}}`

const ogPage = `<!doctype html><html><head><style>
  ${await fontFace('Barlow Condensed', 'barlow-condensed-700.woff2', 700)}
  ${await fontFace('Martian Mono', 'martian-mono.woff2', '100 800', 'font-stretch:75% 112.5%;')}
  body{margin:0;width:1200px;height:630px;background:${INK};color:#F2F3F5;
    display:grid;grid-template-columns:minmax(0,1fr) 340px;align-items:center;gap:48px;padding:0 80px;
    box-sizing:border-box;font-family:'Martian Mono',monospace;font-stretch:78%}
  h1{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:200px;line-height:.86;
    margin:0;letter-spacing:.01em;text-transform:uppercase}
  .lede{margin:28px 0 0;font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:#C9CDD2}
  .row{display:flex;gap:12px;margin-top:40px}
  .tag{border:2px solid rgba(242,243,245,.34);border-radius:6px;padding:10px 16px;font-size:20px;
    letter-spacing:.12em;text-transform:uppercase}
  .tag.now{background:#FFD400;border-color:#FFD400;color:${INK};font-weight:700}
  .art{width:340px;height:340px}
</style></head><body>
  <div>
    <h1>Clipcam</h1>
    <p class="lede">Hold to record · Tap Go to share</p>
    <div class="row"><span class="tag now">Free</span><span class="tag">On-device</span><span class="tag">No watermark</span></div>
  </div>
  <div class="art">${logo.replace('<svg ', '<svg width="100%" height="100%" ')}</div>
</body></html>`

const jobs = [
  { file: 'favicon.png', size: 64, html: iconPage(1, 'transparent') },
  { file: 'pwa-192.png', size: 192, html: iconPage(1, 'transparent') },
  { file: 'pwa-512.png', size: 512, html: iconPage(1, 'transparent') },
  // iOS masks its own corners; a full-bleed square avoids white fringes.
  { file: 'apple-touch-icon.png', size: 180, html: iconPage(0.92, INK) },
  // Maskable: launchers crop to any shape inside the central 80% circle.
  { file: 'pwa-512-maskable.png', size: 512, html: iconPage(0.8, INK) },
  { file: 'og-image.png', width: 1200, height: 630, html: ogPage },
]

const browser = await chromium.launch()
try {
  for (const job of jobs) {
    const width = job.width ?? job.size
    const height = job.height ?? job.size
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
    await page.setContent(job.html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: pub(job.file), omitBackground: true })
    await page.close()
    console.log(`wrote public/${job.file} (${width}×${height})`)
  }
} finally {
  await browser.close()
}
