---
name: blog-post
description: Use when writing, editing, or publishing a post in the Writing section of drozhkov.com, or changing the Writing/Jobs pages. Holds audience, voice, fact rules, the mandatory review and visual checks, deploy steps, and the log of Danil's corrections.
---

# Blog posts on drozhkov.com

Design: `docs/superpowers/specs/2026-10-31-blog-and-jobs-design.md`.

## Audience and goal

Recruiters and hiring managers (goal: they write to Danil), and people coming from his social posts. English only.

## Rules

- Facts only from the project repo in `~/prj/<project>` or from Danil. Never invent metrics, dates, stack or outcomes.
- Qure (`~/prj/qure-app`, a JetBrains product) may be written about **only on this portfolio site** — never in LinkedIn/X posts, Notion shares or other channels (permission given to Danil on 2026-11-03). Title: Design Engineer. Never name JetBrains in the Qure post (the home page hero names it, with the logo). Credit only features Danil authored that landed on qure-app `main` (check `git log main --author=daniil.rozhkov@jetbrains.com` and per-file authorship); teammates' features and unmerged branches are product context at most. Never use internal business data from `knowledge/`.
- `~/prj/pen-editor-app` (pen-editor) is the product **Sideform** — always call it Sideform. Posts about it are only about (1) a part extracted as a library (Figma clipboard decoder, LLM-tolerant batch DSL with atomic rollback, TS flexbox engine, …) or (2) the desktop version (`pen-editor-desktop`). No general build-and-shut-down post-mortem; never claim Sideform was shut down.
- Short and selling, like the cases in `src/data/en.ts`: each text block is 1–3 sentences; a section opens with a one-line logline; write in first person about Danil's decisions and their effect ("I designed…", "I kept…, so users…"); end with outcomes. Cut anything that doesn't show his judgment, craft or result. A post reads in 2–3 minutes.
- Product focus: lead with what the user can do, what problem it solves and how it feels. Technical internals get one short line at most, or are left out.
- Visuals like a case study: a post is as rich as the cases on the home page (see `src/data/en.ts` cases): an image or video for almost every section, plus case extras — slider (sticky subheads with media), full-width images, logline statements, outcome stats. Text-only sections are the exception. Use real product screenshots/recordings only.
- Never put screenshots on a black background. Use the light-gray rounded media block the cases use, or no background at all. Don't bake a backdrop into the image file either — export the screenshot itself.
- TL;DR first: what it is, what Danil did, stack, outcome — scannable in 30 seconds.
- Drafts are published immediately and publicly. Danil reviews on the live site.

## Post file format

- One file per post: `content/posts/<slug>.md`. The slug is the URL: `/en/cases/<slug>/`. Files starting with `_` are skipped.
- Images: `public/images/writing/<slug>/` (cover as `.webp`/`.jpg` ≤ 400 KB, or `.mp4`/`.webm`). Use a real screenshot of the running project, never a mockup from another product. The cover is shown at its natural size on the light-gray rounded case-media block (no black backdrop); omit `cover` and nothing is rendered.
- Parser: `src/writing/posts.ts`. A missing `title`, `dek`, `date`, `tldr` or a bad `category` fails the build.

```markdown
---
title: Project name
dek: One sentence for the index and the meta description.
date: 2026-10-31             # YYYY-MM-DD, publication date
category: design-engineering # design-engineering | ai-tools | product-building
tldr:                        # 3–5 bullets: what it is, what Danil did, stack, outcome
  - …
stack:                       # optional
  - Electron
links:                       # optional; only public URLs you checked (gh repo view … --json visibility)
  - label: Code
    url: https://github.com/dan-rozhkov/<repo>
cover: /images/writing/<slug>/cover.webp  # optional; omit → no cover
---

## Section label

Each `##` becomes a row: the heading is the left label, the text goes on the right.
Text before the first `##` becomes a row with no label. Prose is Markdown.
Images in prose stay at text width; `![alt](src "full")` alone in a paragraph is a full-width image row.

:::logline
A one-sentence statement, shown big like a case logline.
:::

:::slider
### First step
Short text next to the media.
![alt](/images/writing/<slug>/one.webp)

### Second step
Another short text.
![alt](/images/writing/<slug>/two.mp4)
:::

![alt](/images/writing/<slug>/wide.webp "full")

:::outcomes
- 3x — faster
- 40% — fewer errors
Optional closing sentence.
:::
```

Directives (`:::logline`, `:::slider`, `:::outcomes`) sit on their own lines and are closed by `:::`; they are ignored inside fenced code. An unclosed or unknown directive fails the build with the file name and line. Slider items are `### Title`, text, and one image/video each (2+ items for the sticky scroll effect). Outcome stats are `- VALUE — Label` (em dash). Directive text is plain (no inline Markdown). All blocks render with the same components as case studies (`src/components/caseBlocks.tsx`).

## Screenshots

```bash
npm run build
npx vite preview --port 4173 &   # serves dist/; kill it afterwards
npm run shots -- /en/cases/ /en/cases/<slug>/
```

`scripts/screenshots.mjs` writes `shots/<path>-desktop.png` (1440 wide) and `shots/<path>-mobile.png` (390 wide), full page, and exits non-zero if a mobile page scrolls horizontally. `SHOTS_ORIGIN` changes the server, `PW_CHROMIUM` the browser binary. Open every PNG and look at it.

## Mandatory before every deploy

1. Run `/code-review` on the change and fix what it finds.
2. Check the result visually in **two modes: desktop (1440px wide) and mobile (390px wide)**. Take screenshots of every changed page in both modes and look at them. No horizontal scroll on mobile, nothing overlapping, text readable.

Do not deploy if either step was skipped.

## Deploy

`npm run build && npm run deploy`, then commit and push **in the same session**. The automated jobs deploy builds from a clean clone of `origin/main`, so anything deployed but not pushed gets rolled back on the next radar run.

## Corrections log

Every correction Danil sends becomes a rule here (and in Claude's memory). Newest first.

- 2026-11-03 — Home hero is the "Design Engineer at JetBrains, previously … Sber …" text with inline logos (moved out of About); the hero is short so the first case image shows on the first screen. The home Cases block has no title or filters, only the 3 newest cards and the All cases button.
- 2026-11-03 — The Russian version is removed: the site is English only; old `/ru/` URLs redirect to `/en/`.
- 2026-11-03 — One Cases list: `/en/writing/` moved to `/en/cases/` (old URLs redirect). The Cases page lists posts and the home-page case studies together (`src/writing/entries.ts`; a new home case needs a category in `CASE_CATEGORY` there). The home page shows only the 3 newest as cards plus an "All cases" button.
- 2026-11-03 — Card thumbs are shown 16:10 (`object-fit: cover`), so crop the thumb to 16:10 yourself and keep the whole subject in frame (Biscuit's paws were cut off). Biscuit art uses the app's own colour grade (`PACK_GRADE` in `~/prj/tamagochi-exp/tools/make-event-stills.sh`, saturation 1.20) on the raw `.work/*/nano-banana-pro.png`, so it looks as rich as in the app.

- 2026-11-03 — Qure case cover is live: the approved swirl animation (`coverLive: qure-swirl`, `src/components/SwirlCover.tsx`, one turn per π/0.5 ≈ 6.3 s), static `cover-swirl.webp` as fallback, reduced-motion frame and list thumbnail (`thumb`). LiquidGradient is back to the untouched Sideform shader.
- 2026-11-03 — Qure cover approved: a static dithered Swirl (after Paper Shaders' Dithering swirl, 8×8 Bayer, ground #180010) with the Qure mark in the centre and dots in a blue→cyan→pale→amber→orange diagonal gradient (`cover-swirl.webp`). The animated version goes to Notion for approval first.
- 2026-11-03 — Qure cover redo: work in iterations. Start static, matched to the reference (https://pin.it/oxRCTBhem), and send each iteration to Notion (private draft) for Danil's approval before touching the site; animate only after the static look is approved.
- 2026-11-03 — Before reporting any visual change as done, check it side by side with the reference (rendered on the real page, desktop and mobile).
- 2026-11-03 — Post mobile layout: images and videos run edge to edge (no side padding), section labels are small (14px), and spacing is tight and even (20px inside a section, 64px between sections, no empty label line).
- 2026-11-03 — Qure cover: own look, never a 1:1 copy of Sideform. Final: halftone ripples seen from above — a big soft dark centre, near-round wide glowing rings spreading outward (brighter on the near side), calm low-contrast dots that are tiny at the centre and grow outward until they nearly merge (preset `qure` in `LiquidGradient`). The static fallback must be the shader's own t=3 frame, saved under a new filename whenever it changes, so opening the page never flashes an old gradient. Before reporting a visual done, compare it to the reference side by side on the live page, desktop and mobile.
- 2026-11-03 — Don't mention JetBrains in the Qure case; JetBrains appears only on the home page About line, before Sber, with the new JetBrains logo.
- 2026-11-03 — The ban on writing about qure-app is lifted: Danil is allowed to write about Qure publicly, but only in his portfolio.
- 2026-11-03 — Sideform posts: no static screenshots, only videos. Close-ups of UI parts are made as dark-theme stageshow animations with the `sideform-stageshow` skill (`~/prj/pen-editor-app/.claude/skills/`).
- 2026-11-03 — Sideform posts: cover is the landing's LiquidGradient (static frame t=3) with the Sideform app icon centred, not a screenshot; posts match the Biscuit Pet post in media density and include the stageshow promo videos.
- 2026-11-01 — Image corner radius was too big; images have no rounding site-wide.
- 2026-10-31 — Texts too long. Shorten and make them sell Danil as a professional, in the voice and length of the case studies.
- 2026-10-31 — Also take close-up screenshots of interface parts, not only full windows.
- 2026-10-31 — No black background behind screenshots: light gray (like cases) or none; don't bake a backdrop into images.
- 2026-10-31 — Too few images. Posts must be as visual as case studies: many real screenshots and case extras (slider, full-width images, loglines, outcomes).
- 2026-10-31 — Product capabilities first; little or no technical detail.
- 2026-10-31 — pen-editor is Sideform; posts only about its library parts or the desktop version (see Rules).
- 2026-10-31 — Always run `/code-review` and check visually on desktop and mobile before deploying (see above).
