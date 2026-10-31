# Blog and design-engineer jobs on drozhkov.com

Date: 2026-10-31
Status: draft for approval

## Why

drozhkov.com is Danil's hiring showcase. He is moving from product designer to design engineer / product builder. The site has case studies today but no place for the many side projects in `~/prj` that show how he builds.

Two additions:

1. **Writing.** Posts about projects he built. Readers: recruiters and hiring managers (goal: they reach out), plus people coming from his social posts (goal: they read, share, follow).
2. **Jobs.** A live list of design-engineer and product-builder roles worldwide. It serves Danil's own job search and works as a public resource that brings people back to the site.

Success: a recruiter lands on a post from LinkedIn, understands in 30 seconds what Danil built and with what, and has an obvious way to contact him. The jobs page is visibly current (date of last check) without Danil touching it.

## Goals

- `Writing` index, post pages and `Jobs` page inside the existing site, same visual language.
- Posts are drafted by Claude from the project repos and published immediately, publicly. Danil reviews on the live site and sends corrections.
- Jobs refresh automatically after every labor-market-radar run (Mon/Wed/Fri 09:30 Moscow) and deploy without manual steps.
- English only.

## Non-goals

- No Russian versions of posts or the jobs page. The rest of the site keeps its EN/RU locales.
- No CMS, no comments, no newsletter, no analytics work in this project.
- No change to the radar's collection logic. The site only reads its output.
- No Russian-market jobs.

## Anti-goals (failure even if it works)

- A recruiter sees a fact about Danil that is wrong (wrong stack, invented metric, a project claimed that isn't his). Every claim in a post must come from the project repo or from Danil.
- Anything about **qure-app** appears anywhere. It is his employer's product.
- The jobs page shows the radar's internal data: the "Russian roots" fields, Russian-language notes, research comments.
- The jobs page looks stale (old "last checked" date) because the sync silently failed.

## Design decisions (chosen by Danil from coded mockups)

Mockups: Notion page "drozhkov.com — варианты блога и вакансий"; code committed in the local branch `spike/blog-mockups` (commit `eb0d0f0`, folder `src/mock/`, screenshots in `src/mock/shots/`). The spike code is reference only, not to be merged as is.

### Writing index — variant C "Stream"

- Left sticky column (cols 1–4): title "Writing", one-line intro, category filter as a hairline list with counts (All / Design engineering / AI tools / Product building), RSS link.
- Right column (cols 6–15): posts newest first. Each: meta line (date · category) in muted, title at `--text-2xl`, one-sentence dek in muted `--text-lg`, hairline divider.
- No cover images on the index.
- Filter works client-side; it must also work as a URL (`?category=ai-tools`) so it can be linked.

### Post page — variant A "Like a case study"

Reuses the case-study layout (`cs-title-grid`, `cs-row`, `cs-label`):

- Title left (cols 1–6, `--text-2xl`).
- Right: **TL;DR** — 3–5 bullets a recruiter can scan: what it is, what Danil did, stack, outcome.
- Meta row under TL;DR: Published, Read time, Stack, Code (link to repo/npm if public).
- Full-width cover (dark rounded block, `--radius-xl`), image or video.
- Body: each `##` section renders as a `cs-row` — heading as the left label (uppercase, like case labels), text on the right. Images inside the body render full-width like `cs-image-row`.
- Ends with the existing dark `Contact` section.

### Jobs page — variant C "Radar"

- Left sticky column: title "Jobs radar", short intro ("tracked by my own agent"), three stats (open now, new this week, closed this week), filters Role (Design Engineer / Product Builder / GTM Engineer) and Format (Remote / Hybrid / On-site) with counts, "Last check <date, time>".
- Right: white rounded cards (`--radius-md`). Each: role title, `company · location · mode`, salary if known, skill chips (max 4), badge "New" if first seen in the last 7 days, otherwise "Since <date>". Whole card links to the original posting (new tab).
- Sorted: newest first-seen first.

### Navigation

Header gets two links after ABOUT: `WRITING` → `/en/writing/`, `JOBS` → `/en/jobs/`. In the RU locale the labels stay English and point to the same `/en/` URLs (my call: no RU content exists).

## Content model (my call, builder may refine)

- Posts live as Markdown files in `content/posts/<slug>.md` with front-matter: `title`, `dek`, `date`, `category` (one of three), `tldr` (list), `stack` (list), `links` (code/npm/demo), `cover` (path in `public/images/writing/<slug>/`), `draft` is **not** used — everything published is public.
- Read time computed from word count.
- Rendering at build time through the existing SSR + prerender step. Each post and the index and jobs page are prerendered as static HTML.
- Add each post, the index and jobs page to the sitemap. Generate `/en/writing/rss.xml`.
- Each post gets proper `<title>`, description (= dek) and Open Graph tags; OG image = the cover (my call; generated title cards can come later).

## Jobs data flow

Source: `~/prj/labor-market-radar/data/vacancies.csv` (schema in that repo's `data/README.md`).

Filter for the site:
- `market = world`
- `status = active`
- `role_family ∈ {design_engineering, product_building, gtm_engineering}` → labels Design Engineer / Product Builder / GTM Engineer.

Fields exposed: title, company, family, location, work_mode, seniority, salary (min–max, currency, period), first_seen_at, last_checked_at, required_skills (first 4, humanized), source_url. Nothing else. In particular never `russian_roots`, `roots_*`, `notes`, `hiring_constraints`, `inclusion_reason`.

Stats: "new this week" = `first_seen_at` within 7 days of the latest check; "closed this week" = rows with `status = closed` whose `last_checked_at` is within 7 days (same market/family filter).

Salary (my call): show only when `salary_period = year`, formatted like `$175–200k / yr`. Unknown or other periods → no salary shown.

"Last check" = newest `last_checked_at` among exported rows (when the radar actually looked), not the sync time.

Russian text (my call): the sync must publish no Cyrillic in any exposed field.
- In scope: edit the radar's collection prompt (`jobs/cron-tasks.md`, then `hermes cron edit 32d69e3f517f`) so the agent writes `location` in English. This changes output language only, not what is collected.
- Fallback in the sync script: Cyrillic in `location` → "Multiple locations, Europe"; Cyrillic in skills → drop that skill; Cyrillic in title or company → drop the row and log it.

Sync: a script in the site repo (`npm run sync:jobs`) reads the CSV and writes `src/data/jobs.json`. It fails loudly (non-zero exit) if the CSV is missing, empty, or yields zero jobs, so a broken run never deploys an empty page.

Automation (my call on the mechanics): the Hermes "Сбор вакансий" job gets a final step that never touches Danil's working copy:
- Use a separate clean clone, `~/prj/.deploy/dr-portfolio`, reset to `origin/main` each run. In it: `npm ci`, `sync:jobs`, `build`, `deploy`, commit only `src/data/jobs.json`, push. Then the working copy just pulls normally later.
- This means only committed and pushed site code ever goes out through automation. Posts and features are deployed by hand from the working copy only after `/code-review` and screenshots, and must be committed and pushed in the same session, so the next automated run doesn't roll them back.
- Edit the prompt in `cron-tasks.md` first, then `hermes cron edit`.

Failure visibility (my call):
- If sync/build/deploy fails, the job writes the error at the top of that run's collection report in the radar repo (where Danil already reads results).
- The jobs page shows a muted note "Data may be out of date" when "Last check" is more than 4 days old (Mon→Wed→Fri gaps are at most 3 days).

## Publishing workflow and the post-writing skill

- Danil wants drafts live immediately and public. He sends corrections afterwards.
- Create a project skill `.claude/skills/blog-post/SKILL.md` that holds: audience, voice, post structure (TL;DR first), fact-sourcing rule (only from the repo or Danil), banned topics (qure-app), the deploy steps, and a **corrections log**. Every correction Danil sends becomes a rule in this skill and in Claude's memory.
- The skill already exists at `.claude/skills/blog-post/SKILL.md`; extend it, don't replace it.
- **Mandatory before every deploy (Danil's rule):** run `/code-review` and fix findings; check every changed page visually on desktop (1440px) and mobile (390px) from screenshots. This applies to building the feature itself too, not only to posts. The automated jobs deploy is exempt from `/code-review` (data only) but the sync must fail loudly as described above.
- Deploy = `npm run build && npm run deploy` (wrangler to drozhkov.com), then commit and push.

## Scope of this plan vs. the posts (my call)

- This plan builds: Writing index, post page, Jobs page, navigation, RSS/sitemap/OG, jobs sync and automation, plus the **first post (pen-editor)** as the end-to-end proof.
- The WRITING link goes live together with the first post; JOBS goes live as soon as the page passes review.
- Remaining posts are written one per session after that, in the order below, each with its own `/code-review` and screenshots. They are not part of this implementation plan.

## Post list (in this order — my call on order)

Flagship
1. **pen-editor** — "I built an AI design editor alone. Then I shut it down." Case + post-mortem. Sources: `~/prj/pen-editor-app/PORTFOLIO.md`, `MARKET-ANALYSIS.md`, `ROI.md`, subrepos. Later spin-off posts: Figma clipboard decoder, LLM-tolerant batch DSL with rollback, TS flexbox engine.

Design engineering
2. **live-studio** — visual CSS editor with MCP for agents (npm).
3. **tamagochi-exp** — iOS app built with Claude, character photos/video generated on fal.
4. **html-capture** — reimplementing html.to.design's DOM capture.
5. **arc-ui** — components with calm, physical motion.
6. **glow-border** — copy-paste glow component.
7. **explainer** — narrated explainer videos from a JSON spec.

AI tools
8. **ai-chat-file-summaries** — how coding agents show what they changed.
9. **webharvest** — local Firecrawl alternative over MCP.
10. **qa-test-remoter** — LLM-driven GUI test runner.
11. **pm-os** — PM operating system for Claude/Cursor.

Product building
12. **idea-harness** — 8-stage idea validation; includes quickstart-radar and the killed python-diff and revision-wrangler.
13. **labor-market-radar** — the agent behind the Jobs page.
14. **AI podcasts** — one post on generating personal podcasts. No single repo: facts come from the podcast folders in `~/prj` (`*-podcast*`, `designing-for-the-proxy`, `qure-digest` excluded — it's about Qure) — their scripts, `gen_*.py` generators and `sources.md` files. Ask Danil anything not visible there.

Excluded: qure-app, qure-ideas-swipe, slp-journal, rl-env-use, Webwright, personal repos.

Live-studio already has a case study on the site; its post links to the case and covers what the case doesn't (how it works, MCP).

## Left to the builder

- Markdown parser choice (keep dependencies minimal), front-matter parsing.
- How routes plug into `useRoute` / `prerender.js`.
- Mobile layout: sidebars stack above content at ≤900px; must work at phone width with no horizontal scroll.
- Cover images per post: pick from the repo (screenshots, GIFs) or capture the running project; fall back to the dark block with a mark.
- Exact copy of intros and empty states.
