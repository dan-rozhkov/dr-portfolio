import type { PostHogConfig } from "posthog-js";

/**
 * Public, write-only project token. It can only send events to the project;
 * it cannot read data. Safe to ship in the client bundle.
 */
export const POSTHOG_KEY = "phc_kxeyMH86iftyRYWYi96yi9KCvujMbdHmERZysvzvZQGD";
export const POSTHOG_API_HOST = "https://eu.i.posthog.com";
export const POSTHOG_UI_HOST = "https://eu.posthog.com";

/** Analytics only runs on the production site; dev, localhost and previews never send. */
export const ANALYTICS_HOSTS = ["drozhkov.com", "www.drozhkov.com"];

export function isAnalyticsHost(hostname: string): boolean {
  return ANALYTICS_HOSTS.includes(hostname.toLowerCase());
}

const KEPT_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
]);

/**
 * Drop every query parameter except UTM tags, and the hash. Arbitrary params
 * (search terms, tokens, emails pasted into links) never leave the browser.
 */
export function sanitizeUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return value;
  }
  const kept = new URLSearchParams();
  url.searchParams.forEach((v, k) => {
    if (KEPT_PARAMS.has(k.toLowerCase())) kept.append(k, v);
  });
  const search = kept.toString();
  return `${url.origin}${url.pathname}${search ? `?${search}` : ""}`;
}

const URL_PROPERTY = /(url|referrer)$/i;

/** Sanitize every URL-like property on an event (including `$set_once` and `$initial_*`). */
export function sanitizeProperties<T extends Record<string, unknown>>(props: T): T {
  const out: Record<string, unknown> = { ...props };
  for (const [key, value] of Object.entries(out)) {
    if (typeof value === "string" && URL_PROPERTY.test(key)) {
      out[key] = sanitizeUrl(value);
    } else if (value && typeof value === "object" && !Array.isArray(value) && key.startsWith("$set")) {
      out[key] = sanitizeProperties(value as Record<string, unknown>);
    }
  }
  return out as T;
}

export function buildConfig(): Partial<PostHogConfig> {
  return {
    api_host: POSTHOG_API_HOST,
    ui_host: POSTHOG_UI_HOST,
    // No person profiles: events stay anonymous, identify() is never called.
    person_profiles: "never",
    // Consent is handled by the site; the SDK starts opted out and is opted in explicitly.
    opt_out_capturing_by_default: true,
    opt_out_persistence_by_default: true,
    // localStorage only, so the SDK never sets cookies.
    persistence: "localStorage",
    opt_out_capturing_persistence_type: "localStorage",
    // Pageviews are sent manually on real route changes (see analytics.ts).
    capture_pageview: false,
    capture_pageleave: false,
    // Everything we do not use is switched off.
    autocapture: false,
    rageclick: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    enable_heatmaps: false,
    capture_performance: false,
    capture_exceptions: false,
    capture_webmcp: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_surveys_automatic_display: true,
    disable_product_tours: true,
    disable_conversations: true,
    disable_web_experiments: true,
    disable_external_dependency_loading: true,
    advanced_disable_flags: true,
    advanced_disable_feature_flags: true,
    advanced_disable_feature_flags_on_first_load: true,
    advanced_disable_toolbar_metrics: true,
    disable_scroll_properties: true,
    disable_capture_url_hashes: true,
    // Referrer and UTM come from the SDK; URLs are stripped of other params below.
    save_referrer: true,
    save_campaign_params: true,
    mask_personal_data_properties: true,
    before_send: (event) => {
      if (!event) return null;
      event.properties = sanitizeProperties(event.properties ?? {});
      if (event.$set_once) event.$set_once = sanitizeProperties(event.$set_once);
      if (event.$set) event.$set = sanitizeProperties(event.$set);
      return event;
    },
  };
}
