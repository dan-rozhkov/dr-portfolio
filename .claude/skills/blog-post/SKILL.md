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
- Never write about qure-app.
- `~/prj/pen-editor-app` (pen-editor) is the product **Sideform** — always call it Sideform. Posts about it are only about (1) a part extracted as a library (Figma clipboard decoder, LLM-tolerant batch DSL with atomic rollback, TS flexbox engine, …) or (2) the desktop version (`pen-editor-desktop`). No general build-and-shut-down post-mortem; never claim Sideform was shut down.
- Product focus: lead with what the user can do, what problem it solves and how it feels. Technical internals get one short line at most, or are left out.
- Visuals like a case study: a post is as rich as the cases on the home page (see `src/data/en.ts` cases): an image or video for almost every section, plus case extras — slider (sticky subheads with media), full-width images, logline statements, outcome stats. Text-only sections are the exception. Use real product screenshots/recordings only.
- Never put screenshots on a black background. Use the light-gray rounded media block the cases use, or no background at all. Don't bake a backdrop into the image file either — export the screenshot itself.
- TL;DR first: what it is, what Danil did, stack, outcome — scannable in 30 seconds.
- Drafts are published immediately and publicly. Danil reviews on the live site.

## Post file format

- One file per post: `content/posts/<slug>.md`. The slug is the URL: `/en/writing/<slug>/`. Files starting with `_` are skipped.
- Images: `public/images/writing/<slug>/` (cover as `.webp`/`.jpg` ≤ 400 KB, or `.mp4`/`.webm`). Use a real screenshot of the running project, never a mockup from another product. The cover is shown at 16:8 (16:10 on mobile) with `object-fit: cover`, so put a screenshot on a 16:8 dark canvas rather than letting it crop.
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
cover: /images/writing/<slug>/cover.webp  # optional; omit → dark block
---

## Section label

Each `##` becomes a row: the heading is the left label, the text goes on the right.
Text before the first `##` becomes a row with no label. Images in the body render full width.
```

## Screenshots

```bash
npm run build
npx vite preview --port 4173 &   # serves dist/; kill it afterwards
npm run shots -- /en/writing/ /en/writing/<slug>/
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

- 2026-10-31 — Also take close-up screenshots of interface parts, not only full windows.
- 2026-10-31 — No black background behind screenshots: light gray (like cases) or none; don't bake a backdrop into images.
- 2026-10-31 — Too few images. Posts must be as visual as case studies: many real screenshots and case extras (slider, full-width images, loglines, outcomes).
- 2026-10-31 — Product capabilities first; little or no technical detail.
- 2026-10-31 — pen-editor is Sideform; posts only about its library parts or the desktop version (see Rules).
- 2026-10-31 — Always run `/code-review` and check visually on desktop and mobile before deploying (see above).
