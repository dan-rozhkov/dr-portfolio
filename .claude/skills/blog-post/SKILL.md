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
- TL;DR first: what it is, what Danil did, stack, outcome — scannable in 30 seconds.
- Drafts are published immediately and publicly. Danil reviews on the live site.

## Mandatory before every deploy

1. Run `/code-review` on the change and fix what it finds.
2. Check the result visually in **two modes: desktop (1440px wide) and mobile (390px wide)**. Take screenshots of every changed page in both modes and look at them. No horizontal scroll on mobile, nothing overlapping, text readable.

Do not deploy if either step was skipped.

## Deploy

`npm run build && npm run deploy`, then commit and push **in the same session**. The automated jobs deploy builds from a clean clone of `origin/main`, so anything deployed but not pushed gets rolled back on the next radar run.

## Corrections log

Every correction Danil sends becomes a rule here (and in Claude's memory). Newest first.

- 2026-10-31 — pen-editor is Sideform; posts only about its library parts or the desktop version (see Rules).
- 2026-10-31 — Always run `/code-review` and check visually on desktop and mobile before deploying (see above).
