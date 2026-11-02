import type { PostHog } from "posthog-js";
import { POSTHOG_KEY, buildConfig, isAnalyticsHost } from "./config";
import { clearPosthogStorage, readConsent, writeConsent, type Consent } from "./consent";

type Loader = () => Promise<PostHog>;

const defaultLoader: Loader = () => import("posthog-js").then((m) => m.default);

export type ContactChannel = "email" | "linkedin";

interface State {
  consent: Consent | null;
  client: PostHog | null;
  loading: Promise<PostHog | null> | null;
  /** Last pathname sent as a pageview; guards against duplicates. */
  lastPath: string | null;
  /** Case ids whose end was already reported during the current pageview. */
  caseEnds: Set<string>;
  /** True once the SDK is opted in for the current grant; guards against repeat starts. */
  optedIn: boolean;
  /** The single in-flight start, shared by concurrent callers. */
  starting: Promise<void> | null;
  /** Case end reached before consent; reported if consent arrives on the same page. */
  pendingCaseEnd: { path: string; caseId: string } | null;
  listeners: Set<(consent: Consent | null) => void>;
  loader: Loader;
  enabledHost: () => boolean;
}

const state: State = {
  consent: null,
  client: null,
  loading: null,
  lastPath: null,
  caseEnds: new Set(),
  optedIn: false,
  starting: null,
  pendingCaseEnd: null,
  listeners: new Set(),
  loader: defaultLoader,
  enabledHost: () => typeof window !== "undefined" && isAnalyticsHost(window.location.hostname),
};

const isBrowser = () => typeof window !== "undefined";

function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

function active(): PostHog | null {
  return state.consent === "granted" ? state.client : null;
}

async function load(): Promise<PostHog | null> {
  if (state.client) return state.client;
  if (!state.loading) {
    state.loading = state.loader()
      .then((posthog) => {
        // Consent may have been withdrawn while the SDK chunk was downloading.
        if (state.consent !== "granted") return null;
        posthog.init(POSTHOG_KEY, buildConfig());
        state.client = posthog;
        return posthog;
      })
      .catch(() => null)
      .finally(() => {
        state.loading = null;
      });
  }
  return state.loading;
}

function start(): Promise<void> {
  if (!state.starting) {
    state.starting = doStart().finally(() => {
      state.starting = null;
    });
  }
  return state.starting;
}

async function doStart(): Promise<void> {
  if (!state.enabledHost()) return;
  const posthog = await load();
  // Already running for this grant (e.g. Accept pressed again): no second pageview.
  if (!posthog || state.consent !== "granted" || state.optedIn) return;
  state.optedIn = true;
  posthog.set_config({ disable_persistence: false });
  posthog.opt_in_capturing({ captureEventName: false });
  state.lastPath = null;
  trackPage(window.location.pathname);
}

function emit() {
  state.listeners.forEach((fn) => fn(state.consent));
}

/** Read the stored choice and start the SDK only if analytics was accepted earlier. */
export function initAnalytics(): void {
  if (!isBrowser()) return;
  state.consent = readConsent();
  if (state.consent === "granted") void start();
}

export function getConsent(): Consent | null {
  return state.consent;
}

export function subscribeConsent(fn: (consent: Consent | null) => void): () => void {
  state.listeners.add(fn);
  return () => state.listeners.delete(fn);
}

export function grantConsent(): Promise<void> {
  writeConsent("granted");
  state.consent = "granted";
  emit();
  return start();
}

/** Reject, or withdraw an earlier yes: stop capturing and wipe SDK identifiers. */
export function denyConsent(): void {
  writeConsent("denied");
  const wasGranted = state.consent === "granted";
  state.consent = "denied";
  state.optedIn = false;
  state.lastPath = null;
  state.caseEnds.clear();
  state.pendingCaseEnd = null;
  if (state.client) {
    try {
      state.client.opt_out_capturing();
      state.client.set_config({ disable_persistence: true });
      state.client.reset();
    } catch {
      // The SDK failing must never break the page.
    }
  }
  if (wasGranted || state.client) clearPosthogStorage();
  emit();
}

function capture(event: string, properties?: Record<string, string>) {
  const posthog = active();
  if (!posthog) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // Ignore SDK errors.
  }
}

const CASE_PATH = /^\/(en|ru)\/case\/([\w-]+)$/;

/** Send one pageview per real pathname change, plus `case_viewed` on case pages. */
export function trackPage(pathname: string): void {
  const path = normalizePath(pathname);
  // A case end seen before consent only counts for the page it happened on.
  if (state.pendingCaseEnd && state.pendingCaseEnd.path !== path) state.pendingCaseEnd = null;
  if (!active()) return;
  if (path === state.lastPath) return;
  state.lastPath = path;
  state.caseEnds.clear();
  capture("$pageview");
  const match = path.match(CASE_PATH);
  if (match) capture("case_viewed", { case_id: match[2], lang: match[1] });
  const pending = state.pendingCaseEnd;
  state.pendingCaseEnd = null;
  if (pending && pending.path === path) trackCaseEnd(pending.caseId);
}

/** The visitor scrolled to the end of a case study. Sent once per case per pageview. */
export function trackCaseEnd(caseId: string): void {
  if (!active()) {
    // Not accepted yet: remember it, so accepting while still at the end of the case counts.
    if (isBrowser() && state.consent !== "denied") {
      state.pendingCaseEnd = { path: normalizePath(window.location.pathname), caseId };
    }
    return;
  }
  if (state.caseEnds.has(caseId)) return;
  state.caseEnds.add(caseId);
  const lang = normalizePath(window.location.pathname).match(CASE_PATH)?.[1];
  capture("case_end_reached", lang ? { case_id: caseId, lang } : { case_id: caseId });
}

export function trackContactClick(channel: ContactChannel): void {
  capture("contact_clicked", { channel });
}

export function trackResumeClick(): void {
  capture("resume_clicked");
}

/** Middle-click opens a link in a new tab and fires `auxclick`, not `click`. */
export function handleAnalyticsAuxClick(event: MouseEvent): void {
  if (event.button === 1) handleAnalyticsClick(event);
}

/**
 * Delegated click handler for links tagged with `data-analytics`. Only the tag
 * is sent, never the link target (no email address, no URL).
 */
export function handleAnalyticsClick(event: MouseEvent): void {
  if (!active()) return;
  const target = event.target as Element | null;
  const link = target?.closest?.("[data-analytics]");
  if (!link) return;
  const kind = link.getAttribute("data-analytics");
  if (kind === "resume") trackResumeClick();
  else if (kind === "contact-email") trackContactClick("email");
  else if (kind === "contact-linkedin") trackContactClick("linkedin");
}

/** Test hooks. */
export const __testing = {
  reset(options: { loader?: Loader; enabledHost?: () => boolean } = {}) {
    state.consent = null;
    state.client = null;
    state.loading = null;
    state.lastPath = null;
    state.caseEnds.clear();
    state.optedIn = false;
    state.starting = null;
    state.pendingCaseEnd = null;
    state.listeners.clear();
    state.loader = options.loader ?? defaultLoader;
    state.enabledHost = options.enabledHost ?? (() => isAnalyticsHost(window.location.hostname));
  },
};
