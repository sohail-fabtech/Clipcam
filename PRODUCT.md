# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Casual phone users first: people recording everyday moments (family, travel, a day out) who want one finished, shareable video without learning an editor. Creators making vertical short-form clips are the second audience; their tools stay one tap away and never crowd the casual path. The real scene is a phone held in one hand, often outdoors or on the move, sometimes in bright sun, sometimes at night.

## Product Purpose

Clipcam is a hold-to-record clips camera that runs in the browser as an installable PWA. You hold anywhere on the preview to record a clip, arrange and trim clips on a filmstrip timeline, then tap Go to export or share one video file. Success is a finished video in a minute or two, made entirely on the device.

## Positioning

Everything happens on the device: no account, no upload, no server ever sees a clip, and the app works offline. Every feature is free, with no subscription, purchase, or watermark. That combination (private, offline, free, open source) is the claim.

## Operating Context

- Primary target: Chromium on Android, installed as a PWA; iOS Safari and desktop browsers are supported (desktop has full keyboard shortcuts).
- Core loop: Home (six project slots) → Record (hold to record, flip, timer, zoom, torch, location) → Editor (filmstrip timeline: reorder, trim, split, duplicate, photo clips, clip volume, background music) → Go (export MP4/WebM, Share/Save, backup) → optional Send to device (WebRTC) or Receive.
- Projects live in IndexedDB; backups are single `.clipcam` files (legacy `.kodyvideo` still imports).

## Capabilities and Constraints

- Every feature is free: six project slots, 1080p, background music, landscape projects, location tagging, Send to device. No watermark.
- Fully on-device: WebCodecs/Mediabunny export with a realtime canvas fallback; no media ever uploaded. The only network traffic is a short-lived matchmaking room for Send to device.
- Offline-capable installable PWA; must not regress offline boot or update flow.
- Built on Remix 3 (`remix/component`), Vite, Cloudflare Pages; no React.
- No existing functionality may be removed.

## Brand Commitments

- Name: **Clipcam**. Author: Sohail Khan (https://me.jscrate.dev).
- Credits Kody Video (Kent C. Dodds) as its origin and OK Video (Pim Coumans) as the interaction inspiration; not affiliated with either.
- The old koala mascot and Kody branding are retired.

## Evidence on Hand

No testimonials, user counts, press, or benchmarks exist. Do not fabricate any.

## Product Principles

- Recording first: the camera is the product; chrome never competes with the preview.
- Private by construction, not by promise.
- Casual by default, powerful on demand.
- Free means free: no locked states, upsells, or nags anywhere.
- One finished video is the goal; every screen should move the user toward Go.

## Accessibility & Inclusion

One-handed phone use with large touch targets; readable outdoors in bright light; full keyboard support on desktop; respects reduced motion and light/dark preference.
