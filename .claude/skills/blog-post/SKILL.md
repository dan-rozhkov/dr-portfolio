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
thumb: /images/writing/<slug>/thumb.webp  # optional; card image, 16:10
thumbVideo: /images/writing/<slug>/card.mp4  # optional; looping 16:9 card video, needs thumb as its poster
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

- 2026-11-07 — Sber India case is now Caldera AI (URL unchanged). Its card and hero loop `caldera-cover.mp4`; a case gets a video through `previewVideo` and the hero `video` field. The poster is the last frame, so reduced motion shows the whole logo and the start looks like the loop seam. Brand iterations went to Notion first, and the live deploy followed Danil's go-ahead.
Every correction Danil sends becomes a rule here (and in Claude's memory). Newest first.

- 2026-11-06 — Suflyor now translates between 60 languages, so the case no longer says English to Russian. The App video is `app-call-es.mp4`: an English call translated into Spanish, on the app's current code. Danil asked to publish it straight away, without Notion. Sources: `~/prj/suflyor/out/promo-video/scene-es`.
- 2026-11-06 — Suflyor App section: one 16:10 video (`app-call.mp4`) laid out as two beige tiles like `icon-home-screen-v2.webp`: the stageshow promo on the left, its stop frame on the right, in an iPhone frame. The phone screens are the app's real markup and CSS; the dialogue is scripted. Sources: `~/prj/suflyor/out/promo-video`.
- 2026-11-05 — The Published/Read/Code block runs the full content width on mobile, on posts and cases alike (`align-self: stretch` on `.cs-title-meta`); desktop stays as it was.
- 2026-11-05 — Suflyor Icon section: Danil's phone mockup sits next to the app icon as two tiles in one full-width image (`icon-home-screen-v2.webp`). It's a mockup he supplied, so it's an approved exception to "real screenshots only".
- 2026-11-05 — Sideform goes above Biscuit Pet. Their dates are swapped to do it (Sideform 2026-11-01, Biscuit 2026-10-31), so the case order is Qure, Suflyor, Sideform, Biscuit.
- 2026-11-05 — Suflyor case sits second, right after Qure. Cases sort by date, so its `date` is 2026-11-02 (only the month shows). The card is the approved beige animation; a video cover has no poster, so the cover stays the static first frame and the video goes in the Motion section. A post with a video needs its own `ogImage`.
- 2026-11-04 — Jobs logos looked different sizes on mobile. Every logo file is trimmed to its visible ink (no empty space inside the viewBox) and fits one frame: 120×34 desktop, 104×30 mobile, so wordmarks share a width and compact marks share a height. `ratio` in `src/data/job-logos.json` is the trimmed ratio. Check a new logo the same way.
- 2026-11-04 — Jobs page restyled and approved: case-style cards (`src/jobs/JobCard.tsx`), a small logo on `#efefef`, one running tag strip per card out to the page edge, "NEW" ×6 on a small rotating circle. Logos are monotone `#121214` (light parts take the block's `#efefef`) and listed in `src/data/job-logos.json`; a company without a logo shows its name as text, and a new logo must be made monotone too. Jobs is reachable by direct link only: no link in the header, not in the sitemap, `noindex`.
- 2026-11-04 — Sideform post: the approved Dock image (`dock.webp`, in Solution, where it replaced the start-page video) is a deliberate exception to "only videos" and "no black background", and it keeps the Apple icons. App icons in such images are real macOS 26 glass renders (system icons through NSWorkspace, ours compiled from `.icon` with actool), never the old `.icns` files.
- 2026-11-04 — Jobs page: Forward Deployed roles, Growth Engineer, CRM managers and Full Stack Software Engineer are outside the filters, not rejections. Filter them by title in `scripts/jobs/transform.mjs`, keep them `active` in the radar as `adjacent` with `target_selection=excluded`. GTM Engineer - Growth and Product Engineer (Full Stack) stay.
- 2026-11-04 — The site header overlaps page content on mobile while scrolling on purpose. It's a design decision: don't change it or report it as a problem.
- 2026-11-04 — Qure ground is cold near-black `#0E1014`, never the warm burgundy `#180010`. Keep gradients calm like the swirl (mostly cyan, pale, amber). When an asset's colour changes, save it under a new filename so a cached old one can't flash.
- 2026-11-04 — Qure case visuals may use the new pixel brand style as they are (icons, component bento). Don't add copy explaining that the style isn't in the product yet: it's Danil's portfolio and his call.
- 2026-11-04 — Qure's card is the approved spinning mark, 16:9 and animated (`thumbVideo`, `card-spin.mp4`, poster `card-spin.webp`, taken from the video's decoded first frame so playback doesn't jump). The case page keeps the swirl cover. Brand media goes to Notion for approval first; it goes on the site only after Danil approves it.
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
