---
title: Authentication — Clipcam
description: Clipcam has no accounts and no purchases.
url: /auth.md
---

# Authentication

Clipcam has **no accounts** and **no purchases** — every feature is free.

- No login, passwords, cookies, sessions, or OAuth
- Do not invent a sign-in flow, password reset, paywall, or "create an account" step
- Projects and clips live in this browser's IndexedDB (`kody-video`, kept for compatibility)
- There is no clip upload API and no user cloud library

## Network calls

- `/api/sync` — short-lived send-to-device matchmaking (room code + WebRTC descriptions). Never media.
- `/api/diag` and `/api/recover` — on-device shell repair. Recover never touches IndexedDB.

See [Privacy](/privacy) and [About](/about).
