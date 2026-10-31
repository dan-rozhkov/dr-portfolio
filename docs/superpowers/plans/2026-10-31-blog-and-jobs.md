# Writing + Jobs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Writing section (index + posts from Markdown) and a self-updating Jobs page to drozhkov.com, and publish the first post.

**Architecture:** Posts are Markdown files in `content/posts/`, loaded at build time with `import.meta.glob` and parsed into typed objects; pages are React components rendered by the existing SSR + `prerender.js` step. Jobs come from labor-market-radar's CSV through a pure transform (`scripts/jobs/transform.mjs`) into `src/data/jobs.json`; a deploy script run by the radar's Hermes job rebuilds and deploys from a clean clone.

**Tech Stack:** Vite 7, React 19, TypeScript strict, existing SSR prerender, Cloudflare (wrangler). New deps: `marked`, `yaml` (runtime); `vitest`, `csv-parse`, `playwright` (dev).

**Spec:** `docs/superpowers/specs/2026-10-31-blog-and-jobs-design.md`

**Visual reference:** branch `spike/blog-mockups` (commit `eb0d0f0`): `src/mock/Mockups.tsx` (components `BlogC`, `PostA`, `JobsC`), `src/mock/mock.css`, screenshots in `src/mock/shots/`. Port styles from there; do not merge the branch.

## Global Constraints

- English only for Writing and Jobs. RU locale keeps its pages; its header links point to `/en/writing/` and `/en/jobs/`.
- Never mention qure-app anywhere.
- Jobs JSON must never contain: `russian_roots`, `roots_basis`, `roots_source_url`, `notes`, `hiring_constraints`, `inclusion_reason`, or any Cyrillic character.
- Jobs filter: `market = world`, `status = active`, `role_family ∈ {design_engineering, product_building, gtm_engineering}` → labels `Design Engineer` / `Product Builder` / `GTM Engineer`.
- Salary shown only when `salary_period = year`, format `$175–200k / yr` (`$`, `€`, `£`, else `CUR `).
- "Last check" = newest `last_checked_at` among exported rows. Stale note "Data may be out of date" when that is more than 4 days before now.
- All date formatting uses `timeZone: "UTC"` and locale `en-GB`/`en-US` explicitly, so server and client render identical strings (hydration).
- Anything depending on the current time (stale note) is computed in `useEffect`, never during render.
- Reuse tokens from `src/styles/tokens.css`; no new colors outside them except card white `#fff` and chip `#eee` used in the mockup.
- Mobile ≤900px: sticky sidebars become static and stack above content; no horizontal scroll at 390px.
- Before any deploy: `/code-review` with findings fixed, and desktop (1440) + mobile (390) screenshots of every changed page looked at (`.claude/skills/blog-post/SKILL.md`).
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A post file with a missing required front-matter field or bad `category` → build fails with an error naming the file and field, not a blank page. (Task 2)
2. `?category=` with an unknown value → index shows All, no crash. (Task 3)
3. CSV yields zero jobs, or radar rows contain Cyrillic in location/skills/title → sync exits non-zero / cleans or drops the row as specified. (Task 6)
4. `/ru/writing`, `/ru/jobs`, `/en/writing/unknown-slug` → English page, English page, 404 page respectively. (Task 1)
5. Long titles and many skill chips at 390px wide → wrap, no horizontal scroll. (Task 7, screenshot check)

---

### Task 1: Test runner, routes and navigation

**Files:**
- Modify: `package.json` (add `vitest` dev dep, script `"test": "vitest run"`)
- Modify: `src/hooks/useRoute.ts`
- Modify: `src/components/Header.tsx`, `src/i18n/translations.ts`
- Create: `src/lib/writingUrl.ts`
- Test: `src/hooks/useRoute.test.ts`

**Interfaces:**
- Produces: `Route` union extended with `{ name: "writing"; lang: "en"; category: string | null } | { name: "post"; slug: string; lang: "en" } | { name: "jobs"; lang: "en" }`.
- Produces: `writingLink(category?: string): string` → `/en/writing/` or `/en/writing/?category=<slug>`; `postLink(slug: string): string` → `/en/writing/<slug>/`; `jobsLink(): string` → `/en/jobs/` (in `src/lib/writingUrl.ts`, using `BASE`).
- `parseRoute(pathname: string, search?: string): Route` — new optional `search` for `category`.

- [ ] **Step 1: Write failing tests** in `src/hooks/useRoute.test.ts`:

```ts
expect(parseRoute("/en/writing/")).toEqual({ name: "writing", lang: "en", category: null });
expect(parseRoute("/ru/writing", "?category=ai-tools")).toEqual({ name: "writing", lang: "en", category: "ai-tools" });
expect(parseRoute("/en/writing/sideform-desktop/")).toEqual({ name: "post", slug: "pen-editor", lang: "en" });
expect(parseRoute("/ru/jobs/")).toEqual({ name: "jobs", lang: "en" });
expect(parseRoute("/en/case/openprovider")).toEqual({ name: "case", id: "openprovider", lang: "en" });
expect(parseRoute("/ru/")).toEqual({ name: "home", lang: "ru" });
```

- [ ] **Step 2: Run** `npm test` — expected FAIL (writing/post/jobs not recognised).
- [ ] **Step 3: Implement** the route cases in `parseRoute`; `useRoute` passes `window.location.search` on popstate and link clicks. Header: add `WRITING` and `JOBS` links after About, both locales, using `writingLink()` / `jobsLink()`; translation keys `nav.writing` = `"Writing"`, `nav.jobs` = `"Jobs"` in both `en` and `ru` (labels stay English).
- [ ] **Step 4: Run** `npm test && npm run typecheck` — expected PASS. (App renders home for the new routes until Tasks 3/4/7; that's fine.)
- [ ] **Step 5: Commit** `feat: routes and nav links for writing and jobs`

### Task 2: Post content pipeline

**Files:**
- Create: `src/writing/posts.ts`, `src/writing/types.ts`
- Modify: `package.json` (deps `marked`, `yaml`)
- Test: `src/writing/posts.test.ts`

**Interfaces:**
- Produces (`types.ts`):
  ```ts
  export type Category = "design-engineering" | "ai-tools" | "product-building";
  export const CATEGORY_LABEL: Record<Category, string>; // "Design engineering" | "AI tools" | "Product building"
  export interface PostSection { label: string; html: string }   // label "" for text before first ##
  export interface Post {
    slug: string; title: string; dek: string; date: string /* YYYY-MM-DD */;
    category: Category; tldr: string[]; stack: string[];
    links: { label: string; url: string }[]; cover?: string /* path under public/ */;
    readMinutes: number; sections: PostSection[];
  }
  ```
- Produces (`posts.ts`): `parsePost(raw: string, slug: string): Post` (throws `Error("<slug>.md: <problem>")`), `getPosts(): Post[]` (newest first, files starting with `_` ignored), `getPost(slug: string): Post | undefined`, `readMinutes(text: string): number` (words / 220, rounded up, min 1).
- Loading: `import.meta.glob("/content/posts/*.md", { query: "?raw", import: "default", eager: true })`.
- Sections: split body on `^## ` headings; each section's markdown → HTML with `marked`; heading text becomes `label`.

- [ ] **Step 1: Write failing tests:** a valid raw post parses with `title`, `category: "ai-tools"`, `tldr.length === 3`, `sections[1].label === "Split execution"`, `sections[1].html` contains `<p>`; missing `title` throws `/x\.md: missing title/`; `category: "blog"` throws `/x\.md: bad category/`; `readMinutes("word ".repeat(441)) === 3`; `getPosts()` returns dates in descending order (assert on the sorting helper with two parsed posts).
- [ ] **Step 2: Run** `npm test` — expected FAIL.
- [ ] **Step 3: Implement** `posts.ts` and `types.ts` as specified. Required front-matter: `title`, `dek`, `date`, `category`, `tldr` (non-empty list). Optional: `stack`, `links`, `cover`.
- [ ] **Step 4: Run** `npm test && npm run typecheck` — expected PASS.
- [ ] **Step 5: Commit** `feat: markdown post pipeline`

### Task 3: Writing index page (variant C "Stream") + screenshot tool

**Files:**
- Create: `src/writing/WritingIndex.tsx`, `src/styles/components/writing.css`
- Create: `scripts/screenshots.mjs`
- Modify: `src/App.tsx`, `src/main.tsx` (import css), `src/lib/pageTitle.ts`, `package.json` (dev dep `playwright`, script `"shots": "node scripts/screenshots.mjs"`)
- Test: `src/writing/filter.test.ts`

**Interfaces:**
- Consumes: `getPosts`, `CATEGORY_LABEL`, `Route` writing variant, `writingLink`, `postLink`.
- Produces: `filterPosts(posts: Post[], category: string | null): Post[]` (unknown category → all) in `src/writing/filter.ts`; `<WritingIndex category={string|null} />`.
- `scripts/screenshots.mjs <url-path>...` → for each path writes `shots/<name>-desktop.png` (1440×900, fullPage) and `shots/<name>-mobile.png` (390×844, fullPage) against `http://localhost:4173` (vite preview); also fails if `document.documentElement.scrollWidth > innerWidth` on mobile. `shots/` is git-ignored.

- [ ] **Step 1: Failing tests** for `filterPosts`: `"ai-tools"` returns only ai-tools posts; `null` and `"nope"` return all.
- [ ] **Step 2: Run** `npm test` — FAIL.
- [ ] **Step 3: Implement** `filterPosts`, `WritingIndex` (layout, copy and styles from mockup `BlogC`: intro "What I build and why. Long reads on design engineering, AI tooling and product decisions."; filter items are links via `writingLink(slug)`; RSS link → `/en/writing/rss.xml`; each post links to `postLink`; empty state when zero posts: "First post is on its way."). App renders it for `route.name === "writing"`, with `Header` and `Contact`. Page title `Writing | <site title>`. Mobile: side column static above stream.
- [ ] **Step 4: Run** `npm test && npm run typecheck && npm run build`, start `npx vite preview --port 4173` in the background, then `npm run shots -- /en/writing/` — expected tests PASS, screenshots written, no horizontal-scroll error. Look at both images against `src/mock/shots/blog-c.jpg`.
- [ ] **Step 5: Commit** `feat: writing index page`

### Task 4: Post page (variant A "Like a case study")

**Files:**
- Create: `src/writing/PostPage.tsx`
- Modify: `src/App.tsx`, `src/lib/pageTitle.ts`, `src/styles/components/writing.css`

**Interfaces:**
- Consumes: `getPost`, `Post`, `PostSection`, existing classes `cs-title-grid`, `cs-title-name`, `cs-title-intro`, `cs-title-meta`, `cs-row`, `cs-label`, `cs-case-text`, `cs-image`.
- Produces: `<PostPage post={Post} />`.

- [ ] **Step 1: Write a test** `src/writing/PostPage.test.tsx` using `react-dom/server` `renderToString`: output contains the title, each tldr bullet, `Published`, the formatted date `28 Oct 2026` for `2026-10-28`, and each section label. Add `// @vitest-environment node` (no DOM needed).
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** per mockup `PostA`: title left, label "TL;DR" + bullets right, meta `Published / Read (<n> min) / Stack (joined ", ") / Code` (links, only rows with data), cover (image, or video if `.mp4|.webm`, or dark block when absent), then sections as `cs-row` (label left, `dangerouslySetInnerHTML` html right). Images inside section HTML get class `cs-image` via CSS selector, not by rewriting HTML. Unknown slug → render a short "Post not found" block with a link to `writingLink()` (not the home page). Ends with `Contact`. Title `<post title> | <site title>`.
- [ ] **Step 4: Run** `npm test && npm run typecheck`, then build + preview + `npm run shots -- /en/writing/<any-test-post>/` using a temporary `content/posts/_preview.md` copied to a non-underscore name only locally (delete before commit). Compare with `src/mock/shots/post-a.jpg`.
- [ ] **Step 5: Commit** `feat: post page`

### Task 5: Prerender, meta, sitemap, RSS

**Files:**
- Modify: `prerender.js`, `src/entry-server.tsx`, `index.html`
- Create: `src/writing/rss.ts`
- Test: `src/writing/rss.test.ts`

**Interfaces:**
- Produces from `entry-server.tsx`: `posts(): { slug: string; title: string; dek: string; date: string; cover?: string }[]`, `pageMeta(path: string): { title: string; description: string; image: string }`, `rss(origin: string): string`.
- `index.html`: replace static description/og:image values with tokens `%PAGE_DESCRIPTION%` and `%OG_IMAGE%`; `prerender.js` fills them for every page (existing pages keep current description text and `/portrait.png`).
- `buildRss(posts, origin): string` in `rss.ts` — RSS 2.0, channel title "Danil Rozhkov — Writing", items with title, link `${origin}/en/writing/<slug>/`, guid = link, pubDate RFC-822, description = dek; XML-escaped.

- [ ] **Step 1: Failing tests** for `buildRss`: contains `<rss version="2.0">`, one `<item>` per post, `&amp;` escaping in a title with `&`, pubDate `Wed, 28 Oct 2026 00:00:00 GMT` for `2026-10-28`.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** `buildRss`, entry-server exports, and prerender: write `en/writing/index.html`, `en/writing/<slug>/index.html` per post, `en/jobs/index.html`, `en/writing/rss.xml`; add these to `sitemap.xml` (single `en` alternate, no hreflang pairs). Post pages: description = dek, og:image = `${origin}/<cover>` or `/portrait.png`.
- [ ] **Step 4: Run** `npm test && npm run build`; check `dist/en/writing/index.html` exists, `grep -c "<item>" dist/en/writing/rss.xml` equals the number of posts, `grep "%" dist/en/jobs/index.html` finds no leftover tokens (prerender already throws on leftovers).
- [ ] **Step 5: Commit** `feat: prerender writing and jobs, rss, per-page meta`

### Task 6: Jobs transform and sync script

**Files:**
- Create: `scripts/jobs/transform.mjs`, `scripts/jobs/sync.mjs`
- Create: `src/data/jobs.json` (generated, committed), `src/jobs/types.ts`
- Modify: `package.json` (dev dep `csv-parse`, script `"sync:jobs": "node scripts/jobs/sync.mjs"`), `vitest` config include `scripts/**/*.test.mjs`
- Test: `scripts/jobs/transform.test.mjs`

**Interfaces:**
- Produces `src/jobs/types.ts`:
  ```ts
  export type JobFamily = "Design Engineer" | "Product Builder" | "GTM Engineer";
  export interface Job { id: string; title: string; company: string; family: JobFamily; location: string;
    mode: "remote" | "hybrid" | "onsite" | null; seniority: string | null; salary: string | null;
    firstSeen: string; lastChecked: string; skills: string[]; url: string }
  export interface JobsData { generatedFrom: string; lastCheck: string; stats: { open: number; newThisWeek: number; closedThisWeek: number }; jobs: Job[] }
  ```
- Produces `transform.mjs`: `transformRows(rows: Record<string,string>[]): JobsData` (pure; `generatedFrom` = `"labor-market-radar"`). `sync.mjs` reads `process.env.RADAR_CSV ?? ~/prj/labor-market-radar/data/vacancies.csv` (strip BOM), calls `transformRows`, writes pretty JSON to `src/data/jobs.json`; exits 1 with a message if file missing, no rows, or `jobs.length === 0`.
- Rules: skills = first 4 of `required_skills.split("|")`, `_` → space; `mode` `unknown` → null; seniority `unknown` → null; location `"; "`-separated list → first item + ` +N` if more; Cyrillic location → `"Multiple locations, Europe"`; Cyrillic skill → dropped; Cyrillic title or company → row dropped and `console.warn`; sort by `firstSeen` desc; `newThisWeek` = active exported rows with `first_seen_at` ≥ `lastCheck − 7d`; `closedThisWeek` = rows passing market+family filter with `status = closed` and `last_checked_at` ≥ `lastCheck − 7d`.

- [ ] **Step 1: Failing tests** (fixture rows inline):
  - RU-market row and `role_family = adjacent` row excluded;
  - output job objects have exactly the `Job` keys (assert `Object.keys` equals the list) — proves no `russian_roots`/`notes` leak;
  - `JSON.stringify(result)` has no match for `/[А-Яа-яЁё]/` given a row with location `"Нидерланды; Сербия"` and skill `"дизайн"`;
  - salary: `175000/200000/USD/year` → `"$175–200k / yr"`; `5500/6000/USD/unknown` → `null`; `122000/144000/EUR/year` → `"€122–144k / yr"`;
  - location `"Amsterdam, Netherlands; Berlin, Germany; Madrid, Spain"` → `"Amsterdam, Netherlands +2"`;
  - stats on a fixture with lastCheck `2026-10-30`, one row first seen `2026-10-28`, one `2026-10-01`, one closed checked `2026-10-29` → `{ open: 2, newThisWeek: 1, closedThisWeek: 1 }`.
- [ ] **Step 2: Run** `npm test` — FAIL.
- [ ] **Step 3: Implement** `transform.mjs`, `sync.mjs`, `types.ts` per the rules above.
- [ ] **Step 4: Run** `npm test && npm run sync:jobs` — tests PASS; `src/data/jobs.json` has ~44 jobs and `grep -P "[\x{0400}-\x{04FF}]" src/data/jobs.json` prints nothing. `RADAR_CSV=/dev/null npm run sync:jobs; echo $?` prints `1`.
- [ ] **Step 5: Commit** `feat: jobs sync from labor-market-radar`

### Task 7: Jobs page (variant C "Radar")

**Files:**
- Create: `src/jobs/JobsPage.tsx`, `src/jobs/filter.ts`, `src/styles/components/jobs.css`
- Modify: `src/App.tsx`, `src/main.tsx`, `src/lib/pageTitle.ts`
- Test: `src/jobs/filter.test.ts`

**Interfaces:**
- Consumes: `JobsData`, `Job` from Task 6; `jobs.json`.
- Produces: `filterJobs(jobs: Job[], f: { family: JobFamily | null; mode: Job["mode"] }): Job[]`; `isStale(lastCheck: string, now: Date): boolean` (> 4 days); `badge(job: Job, lastCheck: string): string` → `"New"` if `firstSeen` within 7 days before `lastCheck`, else `"Since 24 Oct"` (UTC, en-GB day+short month).

- [ ] **Step 1: Failing tests:** `filterJobs` by family, by mode, both, neither; `isStale("2026-10-30T09:30:00Z", new Date("2026-11-03T10:00:00Z")) === true` and `...("2026-11-02T10:00:00Z") === false`; `badge` returns `"New"` for first seen `2026-10-28` with lastCheck `2026-10-30`, `"Since 24 Oct"` for `2026-10-24`.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** per mockup `JobsC`: title "Jobs radar", intro "Design engineer and product builder roles worldwide, tracked by my own agent.", stats (open now / new this week / closed this week), filters Role and Format with counts as buttons (client state; all off = show all), "Last check <30 Oct, 09:30 UTC>", stale note in `useEffect`; cards are `<a target="_blank" rel="noopener noreferrer">` to `url` with title, `company · location · mode`, salary line when present, ≤4 skill chips, badge. Empty filter result: "No roles match these filters." Mobile: side column static on top, stats in one row.
- [ ] **Step 4: Run** `npm test && npm run typecheck && npm run build`, preview, `npm run shots -- /en/jobs/` — no overflow error; compare with `src/mock/shots/jobs-c.jpg` on desktop and check long titles/chips wrap on mobile.
- [ ] **Step 5: Commit** `feat: jobs page`

### Task 8: Automated jobs deploy

**Files:**
- Create: `scripts/jobs/deploy.sh`
- Modify (other repo): `~/prj/labor-market-radar/jobs/cron-tasks.md` (section "Сбор вакансий"), and the collection prompt's location rule.

**Interfaces:**
- `scripts/jobs/deploy.sh` (bash, `set -euo pipefail`): clone dir `${DEPLOY_DIR:-$HOME/prj/.deploy/dr-portfolio}`; if missing `git clone https://github.com/dan-rozhkov/dr-portfolio.git`; `git fetch origin && git reset --hard origin/main && git clean -fdx -e node_modules`; `npm ci`; `npm run sync:jobs`; `npm test`; `npm run build`; `npm run deploy`; if `git status --porcelain src/data/jobs.json` non-empty → `git add src/data/jobs.json && git commit -m "chore: sync jobs [radar]" && git push origin main`. Never adds other files.

- [ ] **Step 1: Write** `deploy.sh`. Dry run with `DEPLOY_DIR=<scratch dir>` and `npm run deploy` replaced by `echo deploy` via env `DEPLOY_CMD` (default `npm run deploy`) — expected: clone, tests and build pass, prints `deploy`. Do not push from the dry run (`PUSH=0` env guard, default 1).
- [ ] **Step 2: Edit radar prompt** in `cron-tasks.md`: (a) collection rule "Записывай `location` по-английски (названия городов и стран латиницей)"; (b) final step: "После сохранения CSV выполни `bash ~/prj/dr-portfolio/scripts/jobs/deploy.sh`. Если команда завершилась с ошибкой, запиши первой строкой отчёта `reports/YYYY-MM-DD-collection.md`: `⚠️ Сайт не обновлён: <последние 20 строк вывода>`." Commit in the radar repo.
- [ ] **Step 3: Apply** with `hermes cron edit 32d69e3f517f --prompt "<new prompt text from cron-tasks.md>"`; run `hermes cron list` (or equivalent) and confirm the prompt contains `deploy.sh`.
- [ ] **Step 4: Commit** (site repo) `feat: automated jobs deploy script`

### Task 9: First post and launch

**Files:**
- Create: `content/posts/sideform-desktop.md`, `public/images/writing/sideform-desktop/cover.*`
- Modify: `.claude/skills/blog-post/SKILL.md` (front-matter format, file locations, `npm run shots` usage)

- [ ] **Step 1: Write the post** about the **Sideform desktop app** following `.claude/skills/blog-post/SKILL.md` (product name Sideform; never claim it was shut down). Facts only from `~/prj/pen-editor-app/pen-editor-desktop` (its CLAUDE.md/README, code, git history incl. `git rev-list --count HEAD`) and how it relates to `pen-editor` (frontend) and `pen-editor-backend` (agent). Category `design-engineering`. Pick `##` sections from what the repo actually shows (e.g. why a desktop shell, tabs and native menus, the cross-repo command contract, shipping/updates). Cover: a real screenshot of the running Sideform desktop app or editor — not `claude_design_screens/` (that is Claude Design, not Sideform).
- [ ] **Step 2: Update the skill** with the front-matter template and the `shots` command.
- [ ] **Step 3: Verify** `npm test && npm run typecheck && npm run lint && npm run build`; preview; `npm run shots -- /en/ /en/writing/ /en/writing/sideform-desktop/ /en/jobs/` — look at all 8 images.
- [ ] **Step 4: Run `/code-review`** on the branch; fix findings; repeat Step 3 if code changed.
- [ ] **Step 5: Commit** `feat: first post — Sideform desktop`.
- [ ] **Step 6: Deploy and push** `npm run deploy`, then merge to `main` and `git push origin main` in the same session. Check https://drozhkov.com/en/writing/sideform-desktop/ and https://drozhkov.com/en/jobs/ load.
