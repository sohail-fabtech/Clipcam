---
version: 1
slug: "src-app-tsx"
primary_target: "src/app.tsx"
related_targets: ["src/pages/home-page.tsx","src/pages/project-page.tsx"]
---

# Surface brief: Clipcam app shell (all screens)

Scope: every screen of the app (home, record, editor, export overlay/sheet, send/receive, about, privacy, terms, onboarding, 404). Mode: Operate.
Audience: casual phone users first, creators one tap away. Job: record clips, arrange, export one video. Constraints: on-device, offline PWA, no feature removal, light + dark themes, camera stage always dark.

## Direction contract

THESIS: Your shoot is a trip and the app is its travel document: every project is a pass, every number is printed on a board, and only what just changed is lit. Refuses the category default of a near-black camera with a neon accent and soft glowing gradients.

OWN-WORLD: Ink #0B0D10, Slate #1C2127, Steel #6B7178, Panel #E6E8EB, Surface #FFFFFF, Alert yellow #FFD400 (reserved: active/primary/just-changed), REC red only for the live recording dot. Condensed mono (Martian Mono, narrow width) uppercase tracked labels and tabular figures; condensed grotesk (Barlow Condensed) for monumental numbers; system UI face for body. 1px hairline segment dividers, 6px max radius, perforated pass edges, no gradients or glows.

STORY: A visitor sees their projects as passes with clips/length/size printed in segments, knows the one primary action (yellow), records, and gets a finished video presented as a pass with Share/Save.

FIRST VIEWPORT: Home: top bar with CLIPCAM wordmark (mono, tracked) + About/Install icon buttons; six project slots in the existing 2x3 grid, each a mini pass: header row "PROJECT 1  ·  SEQ 03", poster frame, segment row CLIPS | LENGTH | SIZE in tabular mono; an empty slot is a dashed pass with "+ NEW PROJECT". Footer privacy line + storage gauge as a thin board bar. Record: full-bleed dark stage; timer and clip count set monumental in condensed numerals; Go is the yellow primary.

FORM: Boarding pass & gate board (user adopted the declined challenger; ordered list position: challenger), seed key e9d67007. Signature move: the "held change" — whatever just changed (newest clip on the timeline, a freshly saved project slot, the export-ready pass) is lit in alert yellow with a NOW tag and stays lit until the user touches it.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
