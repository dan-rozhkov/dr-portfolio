import { ANALYTICS_ENDPOINT, isAnalyticsHost } from "./config";
import { clearLegacyAnalytics } from "./cleanup";
import { knownPage, validateEvent, type AggregateEvent } from "./schema";

export type ContactChannel = "email" | "linkedin";
let lastPath: string | null = null;
let caseEndSent = false;

export function initAnalytics(): void {
  if (typeof window !== "undefined") clearLegacyAnalytics();
}

function capture(event: AggregateEvent): void {
  if (typeof window === "undefined" || !isAnalyticsHost(window.location.hostname)) return;
  if (
    navigator.doNotTrack === "1" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
  )
    return;
  const payload = validateEvent(event);
  if (!payload) return;
  try {
    void fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit",
      referrerPolicy: "no-referrer",
      mode: "same-origin",
      redirect: "error",
      keepalive: true,
    }).catch(() => {}); // Best effort. No persistent queue or retries.
  } catch {
    // Analytics failures must not stop navigation.
  }
}

export function trackPage(pathname: string): void {
  const page = knownPage(pathname);
  if (page === lastPath) return;
  lastPath = page;
  caseEndSent = false;
  if (!page) return;
  capture({ event: "$pageview", page });
  if (page.includes("/case/")) capture({ event: "case_viewed", page });
}

export function trackCaseEnd(caseId: string): void {
  if (!lastPath || caseEndSent || !lastPath.endsWith(`/case/${caseId}`)) return;
  caseEndSent = true;
  capture({ event: "case_end_reached", page: lastPath });
}

export function trackContactClick(channel: ContactChannel): void {
  if (lastPath) capture({ event: "contact_clicked", page: lastPath, channel });
}

export function trackResumeClick(): void {
  if (lastPath) capture({ event: "resume_clicked", page: lastPath });
}

export function handleAnalyticsAuxClick(event: MouseEvent): void {
  if (event.button === 1) handleAnalyticsClick(event);
}

/** Only fixed link tags leave the browser, never link targets or text. */
export function handleAnalyticsClick(event: MouseEvent): void {
  const link = (event.target as Element | null)?.closest?.("[data-analytics]");
  const kind = link?.getAttribute("data-analytics");
  if (kind === "resume") trackResumeClick();
  else if (kind === "contact-email") trackContactClick("email");
  else if (kind === "contact-linkedin") trackContactClick("linkedin");
}

export const __testing = {
  reset() {
    lastPath = null;
    caseEndSent = false;
  },
};
