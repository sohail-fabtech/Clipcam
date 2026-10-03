/**
 * Markdown-for-agents responses for the public pages: the same
 * Accept: text/markdown negotiation Cloudflare's hosted converter would do,
 * which is not available on every plan.
 */

export const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=yes'

export type AgentPageId = 'home' | 'about' | 'privacy' | 'terms' | 'receive' | 'auth'

type AgentPage = {
  title: string
  description: string
  canonical: string
  body: string
}

const PAGES: Record<AgentPageId, AgentPage> = {
  home: {
    title: 'Clipcam',
    description:
      'Hold anywhere to record clips. Privacy-first camera for the web. Record shot by shot, trim on a filmstrip, export one video. Free, with no watermark.',
    canonical: '/',
    body: `# Clipcam

Privacy-first clips camera for the web. Hold anywhere on the preview to record, arrange clips on a filmstrip timeline, then tap **Go** to export or share one video — all on your device.

## What it is

- Free and open source — every feature, no subscription, no watermark
- No accounts, no clip uploads, no analytics, no tracking
- Projects live in this browser's IndexedDB until you export, back up, or send them
- Installable PWA that works offline (Chromium, especially Android, is the primary target)

## How to use it

1. Open the app and allow the camera
2. Hold anywhere on the preview to record a clip; release to stop
3. Arrange, duplicate, split, delete, and trim clips on the filmstrip
4. Tap **Go** to export one video, then Share or Save

Photos can be added to the timeline as still clips. Desktop can record a screen or window as a regular clip. Six project slots, 1080p recording, background music, landscape projects, optional location tagging, and Send to device are all included.

## Support

Made by Sohail Khan — [me.jscrate.dev](https://me.jscrate.dev).

See [About](/about), [Privacy](/privacy), [Terms](/terms), and [auth.md](/auth.md).
`,
  },
  about: {
    title: 'About — Clipcam',
    description: 'Clipcam is a free, open-source, on-device clips camera for the web.',
    canonical: '/about',
    body: `# About Clipcam

Clipcam is a free and open source clips camera by Sohail Khan ([me.jscrate.dev](https://me.jscrate.dev)). Every feature is free — there is no subscription, purchase, or watermark.

## Credits

Clipcam is built on [Kody Video](https://github.com/kentcdodds/kody-video) by Kent C. Dodds. The hold-to-record interaction model is inspired by [OK Video](https://okvideo.app) by Pim Coumans. Clipcam is an independent project and is not affiliated with either.

## Private by design

No accounts, no uploads, no analytics, no crash reporting. Clips live in this browser's storage until you export and share them yourself.

The app's only own network traffic is a short-lived \`/api/sync\` matchmaking room if you tap Send to device (code + WebRTC descriptions, never clips).

## Made for phones

Designed as a mobile camera app. Desktop has keyboard support (hold Space to record, F flip, T timer, E editor, P play).

## Backups

Every project can be saved as a \`.clipcam\` file (⋯ → Save backup); older \`.kodyvideo\` backups import too. You can also Send to device; the other device opens [/receive](/receive). Restore a backup from the About page in the app, or drop the file anywhere.

A poisoned or stale app shell (hero with no project slots) can be diagnosed at [/api/diag](/api/diag) and repaired at [/api/recover](/api/recover). Recover never touches IndexedDB.

## Legal

[Privacy](/privacy) · [Terms](/terms) · [auth.md](/auth.md)
`,
  },
  privacy: {
    title: 'Privacy — Clipcam',
    description:
      'Clipcam keeps recordings on your device. No accounts, no uploads, no analytics, no tracking.',
    canonical: '/privacy',
    body: `# Privacy

Last updated: October 2026

## Everything stays on your device

All recordings, projects, and edits live in this browser's on-device storage (IndexedDB). Nothing is uploaded. There are no accounts, no cookies, and no cross-site tracking.

## No analytics, no crash reports

Clipcam runs no analytics and sends no crash reports. The only data the app ever sends on its own is a short-lived matchmaking room, and only when you tap Send to device.

## Send to another device

Clipcam can send a project to another phone or computer that has the app open. A Cloudflare matchmaker introduces the two browsers (a short code plus the WebRTC connection description, which includes network addresses). Your clips never go to a server — they travel device-to-device, encrypted. Rooms expire in minutes and are not stored as a library.

## Camera and microphone

The camera and microphone are used only while the app is open, on the camera view. Nothing is ever streamed anywhere.

## Optional location tagging

Location tagging is optional and off by default. When it is on, each new clip stores device coordinates locally. Exported videos omit location by default; you can explicitly include it in MP4 metadata from the export sheet.

## Exports and sharing

Exported or shared files leave the device only when you share or save them yourself.

## Deleting your data

Delete projects in the app, or clear this site's browsing data / uninstall the PWA. There is no server copy to delete.

## Questions

Reach Sohail Khan at [me.jscrate.dev](https://me.jscrate.dev).

See also [Terms](/terms) and [About](/about).
`,
  },
  terms: {
    title: 'Terms — Clipcam',
    description: 'Terms of use for the on-device Clipcam clips camera.',
    canonical: '/terms',
    body: `# Terms

Last updated: October 2026

## Free to use, as is

Clipcam is free to use — every feature, with no subscription, purchase, or watermark — and runs entirely on your device. It is provided "as is" without warranty of any kind. Use it at your own risk — always keep copies of recordings you care about. Device storage can be cleared by the browser or OS.

## Your recordings are yours

You own your recordings entirely. The app claims no rights to any of your content.

## Recording responsibly

Don't use the app to record people unlawfully. You are responsible for complying with local recording and consent laws.

## Liability

Clipcam is free, and to the extent the law allows, its authors are not liable for any loss arising from its use.

## Changes and affiliation

These terms may change with the app; they are versioned with its open-source code. Questions: [me.jscrate.dev](https://me.jscrate.dev). Clipcam is not affiliated with OK Video.

See also [Privacy](/privacy) and [About](/about).
`,
  },
  receive: {
    title: 'Receive a project — Clipcam',
    description: 'Accept a Clipcam project sent from another device. Free. Clips never upload.',
    canonical: '/receive',
    body: `# Receive a project

Open this page on the receiving device when someone taps **Send to device**. The two browsers pair with a short code or QR and the project travels over a WebRTC DataChannel.

Clips never land on a server. If the devices cannot connect, use **Save backup** and import the \`.clipcam\` file instead.

There is no account. See [auth.md](/auth.md) and [About](/about).
`,
  },
  auth: {
    title: 'Authentication — Clipcam',
    description: 'Clipcam has no accounts and no purchases.',
    canonical: '/auth.md',
    body: `# Authentication

Clipcam has **no accounts** and **no purchases** — every feature is free.

- No login, passwords, cookies, sessions, or OAuth
- Do not invent a sign-in flow, password reset, paywall, or "create an account" step
- Projects and clips live in this browser's IndexedDB (\`kody-video\`, kept for compatibility)
- There is no clip upload API and no user cloud library

## Network calls

- \`/api/sync\` — short-lived send-to-device matchmaking (room code + WebRTC descriptions). Never media.
- \`/api/diag\` and \`/api/recover\` — on-device shell repair. Recover never touches IndexedDB.

See [Privacy](/privacy) and [About](/about).
`,
  },
}

export function pageIdForPath(pathname: string): AgentPageId | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  switch (path) {
    case '/':
    case '/index.html':
    case '/app':
    case '/app.html':
      return 'home'
    case '/about':
    case '/about.html':
      return 'about'
    case '/privacy':
    case '/privacy.html':
      return 'privacy'
    case '/terms':
    case '/terms.html':
      return 'terms'
    case '/receive':
      return 'receive'
    case '/auth.md':
      return 'auth'
    default:
      return null
  }
}

function acceptQuality(accept: string | null, type: string): number {
  if (!accept) return 0
  let best = 0
  for (const part of accept.split(',')) {
    const [media, ...params] = part.split(';').map((token) => token.trim())
    if (media?.toLowerCase() !== type) continue
    const qParam = params.find((param) => param.toLowerCase().startsWith('q='))
    const quality = qParam ? Number(qParam.slice(2)) : 1
    if (Number.isFinite(quality) && quality > 0) best = Math.max(best, quality)
  }
  return best
}

/** True when text/markdown is present with q>0 and is not outranked by text/html. */
export function prefersMarkdown(accept: string | null): boolean {
  const markdown = acceptQuality(accept, 'text/markdown')
  if (markdown <= 0) return false
  return markdown >= acceptQuality(accept, 'text/html')
}

export function renderAgentMarkdown(id: AgentPageId): string {
  const page = PAGES[id]
  switch (id) {
    case 'home':
    case 'about':
    case 'privacy':
    case 'terms':
    case 'receive':
    case 'auth':
      return `---
title: ${page.title}
description: ${page.description}
url: ${page.canonical}
---

${page.body.trim()}\n`
    default: {
      const exhaustive: never = id
      throw new Error(`Unhandled agent page: ${String(exhaustive)}`)
    }
  }
}

export function agentMarkdownResponse(request: Request): Response | null {
  const method = request.method.toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') return null

  const url = new URL(request.url)
  const id = pageIdForPath(url.pathname)
  if (!id) return null

  const accept = request.headers.get('accept')
  if (id !== 'auth' && !prefersMarkdown(accept)) return null

  const body = renderAgentMarkdown(id)
  const headers = {
    'content-type': 'text/markdown; charset=utf-8',
    vary: 'Accept',
    'cache-control': 'public, max-age=3600',
    'x-markdown-tokens': String(Math.ceil(body.length / 4)),
    'content-signal': CONTENT_SIGNAL,
  }

  if (method === 'HEAD') return new Response(null, { status: 200, headers })
  return new Response(body, { status: 200, headers })
}
