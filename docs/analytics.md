# Anonymous aggregate analytics

## Decision

The site uses its existing Cloudflare Worker and existing PostHog EU project token.
No account, paid service, database, secret or new provider endpoint was provisioned.
The repository previously deployed static assets with Wrangler to `drozhkov.com`.
It had no Analytics Engine binding or configured hosting event collector.
Wrangler account authentication is expired, so dashboard settings and account limits
could not be inspected. The existing PostHog ingestion endpoint was tested directly.

Browser → same-origin `POST /api/aggregate` → Worker →
`https://eu.i.posthog.com/i/v0/e/`.

This is event-count analytics, not unique-visitor analytics. The browser SDK is removed.
The browser sends only a fixed event name, an allowlisted published page path, and,
for contact clicks, `email` or `linkedin`. Queries (including UTM), fragments,
referrers, link targets and free-form path segments are never analytics properties.
The Worker validates exact keys and rebuilds the outbound payload and headers.
It adds only language, case label, an aggregate-mode marker and privacy controls.

PostHog requires `distinct_id`. Every request uses the SAME dataset label,
`portfolio-aggregate-v1`. This is not a visitor, browser, device or session identifier.
No identifier is generated, persisted, hashed or derived from browser/network data.
`$process_person_profile: false` prevents new person profiles.
`$geoip_disable: true` disables location enrichment. `$ip: "0.0.0.0"` prevents an
absent/falsy IP property from being populated from the server connection.
Client-IP and country headers are explicitly overwritten with fixed non-visitor values,
including CF-Connecting-IP, X-Real-IP, X-Forwarded-For, CF-Connecting-IPv6 and CF-IPCountry.
Cookies, User-Agent and Referer are not copied. Redirects are not followed.
Worker observability is disabled. Application code does not log analytics requests.

PostHog's general documentation recommends per-visit IDs for anonymous product
analytics. This site deliberately shares a dataset label because it needs total
counts and must not distinguish visits. Do not interpret PostHog's unique users,
sessions, retention, funnels or person timelines for this dataset. Use **total event
count**, break down by `page`, `case_id`, `lang` or `channel`, and filter
`analytics_mode = aggregate_v1`. Do not mix legacy SDK events into these results.
At high volumes, PostHog applies per-distinct-ID ingestion protection. A shared label
is suitable for this small portfolio, not a general high-volume analytics design.

Preserved events: `$pageview`, `case_viewed`, `case_end_reached`, `resume_clicked`,
`contact_clicked`. Repeated React effects, query/hash changes and repeat case-end
observations do not add counts on the same page. Reloads and return navigation count
again. Counts are best effort, with no storage queue or retry identifiers. Bots and
forged same-origin requests can inflate counts. Ad blockers, network failures, DNT
and Global Privacy Control can reduce counts. There is no tracking-based abuse filter.

`pages.json` contains only published pages. The content-sync test fails if a case or
post is added without updating this list. Unknown pages are dropped, not generalized
from user-supplied path segments. The standalone Privacy page does not send analytics.

## Storage migration and Privacy

Every client startup attempts to remove `dr_analytics_consent`, `ph_*` and `__ph_*`
from localStorage/sessionStorage and visible legacy cookies at applicable paths and
host/parent domains. It creates no migration marker or replacement identifier.
Unrelated storage is preserved. HttpOnly cookies, inaccessible paths, other origins
and closed tabs cannot be cleaned by this script. Previously loaded old tabs can
continue running their old SDK until reloaded. Historical PostHog records are not
removed by this change.

The footer links to `/privacy.html` (English only). All consent panels,
settings controls, consent translations and banner CSS/tests are removed.
The Privacy page explains event-level storage, provider infrastructure processing,
legacy data, and external destinations. Absence of cookies does **not** establish
that consent is unnecessary. Applicable law, provider contracts, retention, project
transformations and historical-data deletion remain owner review items.
Cloudflare still processes connection data to serve HTTP. PostHog sees server traffic
and ingestion time. This is not a claim of zero infrastructure personal-data processing.
No access to the PostHog read API/dashboard was available to inspect retention,
transformations, historical persons or persisted event rows.

## Verification on 2026-11-03

- `npm uninstall posthog-js`: removed 11 packages. npm reported 18 dependency
  vulnerabilities (15 moderate, 3 high). Dependency remediation outside this
  analytics migration was not performed.
- `npm run typecheck`: passed.
- `npm test`: 88 tests passed across 11 files.
- `npm run build`: passed, including all prerendered routes. Vite reports an existing
  main-bundle size warning above 500 kB.
- `npm run lint`: no errors, three warnings in unrelated CaseIndicator/i18n context.
- `npm run lint:css`: passed.
- Direct PostHog probe using the real existing project token and aggregate payload:
  `analytics_verification` returned HTTP 200, `{"status":"Ok"}`. One probe event
  was sent. It is separate from the normal page/click counters.
- Local Wrangler Worker → real PostHog ingestion: a synthetic `$pageview` for `/en`
  returned HTTP 204. One successful synthetic pageview is included in aggregate counts.
  Earlier local attempts failed before sending because Workers do not support
  `redirect: "error"`. The Worker now uses `manual` and rejects redirect responses.
- `node scripts/analytics-browser.mjs`: passed at 1440×1000 and 390×844,
  six routes per viewport, 11 inspected events per viewport, no banner, empty
  analytics storage and no unexpected external requests. Existing Fontshare CSS
  is counted separately. Privacy navigation follows Cloudflare’s .html redirect.
- Ingestion acceptance is verified. Persisted rows and provider dashboard results
  are not verified without read access. Local workerd cannot verify headers added
  by production Cloudflare infrastructure. Verify those after an authorized deployment.

Repeat local runtime check without deployment:

```sh
npm run build
WRANGLER_REGISTRY_PATH=/tmp/dr-portfolio-worker-registry WRANGLER_LOG_PATH=/tmp/dr-portfolio-wrangler.log npx wrangler dev --local --port 8798
node scripts/analytics-browser.mjs
```

Restart Wrangler after rebuilding: its asset watcher can reach the platform limit
and retain an outdated asset manifest during local development.

The browser script checks desktop/mobile rendering, six routes, banner absence,
Privacy links/page, legacy storage removal, analytics payloads, missing Cookie/Referer
on event requests, and absence of third-party analytics requests. Existing Fontshare stylesheet requests
are detected separately and mocked locally. The existing font setup is unchanged and
its infrastructure processing is disclosed on the Privacy page. It intercepts events
locally and does not send browser-test traffic to PostHog.

No commit, push or deployment was performed. The new collector route becomes public
only when the modified Worker and built assets are deployed together. No new secret
is needed. Deployment will require restored Cloudflare authentication. Hosting quotas
and PostHog retention/settings were not changed. Do not deploy the client assets alone.

## Official references

- [PostHog capture API](https://posthog.com/docs/api/capture): endpoint, required fields,
  anonymous capture controls.
- [PostHog anonymous events](https://posthog.com/docs/data/anonymous-vs-identified-events):
  profile behavior and the provider's usual per-visit-ID recommendation.
- [PostHog API overview](https://posthog.com/docs/api): shared-distinct-ID ingestion limits.
- [Cloudflare asset/Worker routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/):
  selective `run_worker_first` and ASSETS binding.
- [Cloudflare subrequest IP headers](https://developers.cloudflare.com/fundamentals/reference/http-headers/):
  runtime-added headers and Worker overrides.

## Exact changed files

- Modified: `package-lock.json`
- Modified: `package.json`
- Modified: `src/App.tsx`
- Modified: `src/CaseStudy.tsx`
- Modified: `src/Contact.tsx`
- Modified: `src/analytics/analytics.test.ts`
- Modified: `src/analytics/analytics.ts`
- Removed: `src/analytics/config.test.ts`
- Modified: `src/analytics/config.ts`
- Removed: `src/analytics/consent.ts`
- Removed: `src/analytics/sdk-network.test.ts`
- Modified: `src/analytics/ssr.test.tsx`
- Removed: `src/components/ConsentBanner.test.tsx`
- Removed: `src/components/ConsentBanner.tsx`
- Modified: `src/i18n/translations.ts`
- Modified: `src/main.tsx`
- Removed: `src/styles/components/consent.css`
- Modified: `src/styles/components/contact.css`
- Modified: `wrangler.jsonc`
- Added: `docs/analytics.md`
- Added: `public/privacy.html`
- Added: `scripts/analytics-browser.mjs`
- Added: `src/analytics/cleanup.ts`
- Added: `src/analytics/pages.json`
- Added: `src/analytics/schema.ts`
- Added: `src/analytics/worker-entry.ts`
- Added: `src/analytics/worker.test.ts`
- Added: `src/analytics/worker.ts`
