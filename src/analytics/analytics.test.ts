// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { PostHog } from "posthog-js";
import {
  __testing,
  denyConsent,
  getConsent,
  grantConsent,
  handleAnalyticsAuxClick,
  handleAnalyticsClick,
  initAnalytics,
  trackCaseEnd,
  trackPage,
} from "./analytics";
import { CONSENT_KEY } from "./consent";
import { POSTHOG_KEY } from "./config";

function fakePosthog() {
  return {
    init: vi.fn(),
    capture: vi.fn(),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
    reset: vi.fn(),
    set_config: vi.fn(),
    identify: vi.fn(),
  };
}

type Fake = ReturnType<typeof fakePosthog>;

let ph: Fake;
let loader: Mock<() => Promise<PostHog>>;

function setup({ enabledHost = true } = {}) {
  ph = fakePosthog();
  loader = vi.fn(async () => ph as unknown as PostHog);
  __testing.reset({ loader, enabledHost: () => enabledHost });
}

const events = () => ph.capture.mock.calls.map((c) => c[0]);

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/en/");
  setup();
});

describe("before any choice", () => {
  it("loads nothing and sends nothing", () => {
    initAnalytics();
    trackPage("/en/");
    trackCaseEnd("sber");
    expect(getConsent()).toBeNull();
    expect(loader).not.toHaveBeenCalled();
    expect(ph.capture).not.toHaveBeenCalled();
  });
});

describe("reject", () => {
  it("stores the choice, never loads the SDK, sends nothing", () => {
    denyConsent();
    trackPage("/en/case/sber");
    expect(localStorage.getItem(CONSENT_KEY)).toBe("denied");
    expect(loader).not.toHaveBeenCalled();
    expect(ph.capture).not.toHaveBeenCalled();
  });

  it("a stored rejection keeps the SDK off on the next visit", () => {
    localStorage.setItem(CONSENT_KEY, "denied");
    initAnalytics();
    trackPage("/en/");
    expect(loader).not.toHaveBeenCalled();
  });
});

describe("accept", () => {
  it("initialises once with the project key and a locked-down config", async () => {
    await grantConsent();
    expect(localStorage.getItem(CONSENT_KEY)).toBe("granted");
    expect(loader).toHaveBeenCalledTimes(1);
    expect(ph.init).toHaveBeenCalledTimes(1);
    const [key, config] = ph.init.mock.calls[0];
    expect(key).toBe(POSTHOG_KEY);
    expect(config).toMatchObject({
      api_host: "https://eu.i.posthog.com",
      person_profiles: "never",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      capture_heatmaps: false,
      disable_surveys: true,
      advanced_disable_flags: true,
      persistence: "localStorage",
      opt_out_capturing_by_default: true,
    });
    expect(ph.opt_in_capturing).toHaveBeenCalledWith({ captureEventName: false });
    expect(ph.identify).not.toHaveBeenCalled();
  });

  it("sends the current pageview right away", async () => {
    await grantConsent();
    expect(events()).toEqual(["$pageview"]);
  });

  it("restores an earlier yes on the next visit", async () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    initAnalytics();
    await vi.waitFor(() => expect(events()).toEqual(["$pageview"]));
  });

  it("does nothing on hosts other than drozhkov.com", async () => {
    setup({ enabledHost: false });
    await grantConsent();
    trackPage("/en/case/sber");
    expect(loader).not.toHaveBeenCalled();
    expect(getConsent()).toBe("granted");
  });

  it("does not initialise if consent is withdrawn while the SDK downloads", async () => {
    let release: (v: PostHog) => void = () => {};
    loader.mockImplementation(() => new Promise<PostHog>((r) => (release = r)));
    const pending = grantConsent();
    denyConsent();
    release(ph as unknown as PostHog);
    await pending;
    expect(ph.init).not.toHaveBeenCalled();
    expect(ph.capture).not.toHaveBeenCalled();
  });
});

describe("pageviews and cases", () => {
  beforeEach(async () => {
    await grantConsent();
    ph.capture.mockClear();
  });

  it("does not duplicate pageviews for the same path", () => {
    trackPage("/en/");
    trackPage("/en");
    trackPage("/en/writing/");
    trackPage("/en/writing");
    expect(events()).toEqual(["$pageview"]);
  });

  it("sends case_viewed with the case id and language", () => {
    trackPage("/ru/case/sber/");
    expect(ph.capture.mock.calls).toEqual([
      ["$pageview", undefined],
      ["case_viewed", { case_id: "sber", lang: "ru" }],
    ]);
  });

  it("sends case_end_reached once per case pageview", () => {
    window.history.replaceState({}, "", "/en/case/sber");
    trackPage("/en/case/sber");
    trackCaseEnd("sber");
    trackCaseEnd("sber");
    expect(ph.capture).toHaveBeenLastCalledWith("case_end_reached", { case_id: "sber", lang: "en" });
    expect(events().filter((e) => e === "case_end_reached")).toHaveLength(1);

    window.history.replaceState({}, "", "/en/case/other");
    trackPage("/en/case/other");
    trackCaseEnd("other");
    expect(events().filter((e) => e === "case_end_reached")).toHaveLength(2);
  });
});

describe("repeat and concurrent starts", () => {
  it("pressing Accept again does not send a second pageview", async () => {
    await grantConsent();
    await grantConsent();
    expect(events().filter((e) => e === "$pageview")).toHaveLength(1);
    expect(ph.init).toHaveBeenCalledTimes(1);
  });

  it("Accept, Reject, Accept during the SDK download sends one pageview", async () => {
    window.history.replaceState({}, "", "/en/case/sber");
    const first = grantConsent();
    denyConsent();
    const second = grantConsent();
    await Promise.all([first, second]);
    expect(events().filter((e) => e === "$pageview")).toHaveLength(1);
    expect(events().filter((e) => e === "case_viewed")).toHaveLength(1);
  });

  it("restoring consent while Accept is pressed sends one pageview", async () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    initAnalytics();
    await grantConsent();
    expect(events().filter((e) => e === "$pageview")).toHaveLength(1);
  });
});

describe("case end before consent", () => {
  it("is sent if the visitor accepts while still on that case", async () => {
    window.history.replaceState({}, "", "/en/case/sber");
    trackPage("/en/case/sber");
    trackCaseEnd("sber");
    expect(ph.capture).not.toHaveBeenCalled();
    await grantConsent();
    expect(events()).toEqual(["$pageview", "case_viewed", "case_end_reached"]);
  });

  it("is dropped after navigating to another page", async () => {
    window.history.replaceState({}, "", "/en/case/sber");
    trackCaseEnd("sber");
    window.history.replaceState({}, "", "/en/");
    trackPage("/en/");
    await grantConsent();
    expect(events()).not.toContain("case_end_reached");
  });

  it("is never sent after a rejection", () => {
    denyConsent();
    window.history.replaceState({}, "", "/en/case/sber");
    trackCaseEnd("sber");
    expect(loader).not.toHaveBeenCalled();
  });
});

describe("contact and resume clicks", () => {
  function click(attrs: Record<string, string>) {
    const a = document.createElement("a");
    for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
    const span = document.createElement("span");
    a.appendChild(span);
    document.body.appendChild(a);
    handleAnalyticsClick({ target: span } as unknown as MouseEvent);
    a.remove();
  }

  it("counts a middle-click, ignores other aux buttons", async () => {
    await grantConsent();
    ph.capture.mockClear();
    const a = document.createElement("a");
    a.setAttribute("data-analytics", "resume");
    document.body.appendChild(a);
    handleAnalyticsAuxClick({ target: a, button: 2 } as unknown as MouseEvent);
    handleAnalyticsAuxClick({ target: a, button: 1 } as unknown as MouseEvent);
    a.remove();
    expect(events()).toEqual(["resume_clicked"]);
  });

  it("sends nothing without consent", () => {
    click({ href: "mailto:someone@example.com", "data-analytics": "contact-email" });
    expect(ph.capture).not.toHaveBeenCalled();
  });

  it("sends the channel only, never the address or URL", async () => {
    await grantConsent();
    ph.capture.mockClear();
    click({ href: "mailto:someone@example.com", "data-analytics": "contact-email" });
    click({ href: "https://www.linkedin.com/in/x/", "data-analytics": "contact-linkedin" });
    click({ href: "/cv.pdf", "data-analytics": "resume" });
    click({ href: "/en/writing/" });
    expect(ph.capture.mock.calls).toEqual([
      ["contact_clicked", { channel: "email" }],
      ["contact_clicked", { channel: "linkedin" }],
      ["resume_clicked", undefined],
    ]);
    expect(JSON.stringify(ph.capture.mock.calls)).not.toContain("example.com");
  });
});

describe("withdraw", () => {
  it("opts out, resets, wipes PostHog storage and stops sending", async () => {
    await grantConsent();
    localStorage.setItem(`ph_${POSTHOG_KEY}_posthog`, '{"distinct_id":"abc"}');
    localStorage.setItem(`__ph_opt_in_out_${POSTHOG_KEY}`, "1");
    sessionStorage.setItem(`ph_${POSTHOG_KEY}_window_id`, "w");
    localStorage.setItem("unrelated", "keep");
    document.cookie = `ph_${POSTHOG_KEY}_posthog=x; path=/`;
    ph.capture.mockClear();

    denyConsent();

    expect(ph.opt_out_capturing).toHaveBeenCalled();
    expect(ph.reset).toHaveBeenCalled();
    expect(ph.set_config).toHaveBeenLastCalledWith({ disable_persistence: true });
    expect(localStorage.getItem(CONSENT_KEY)).toBe("denied");
    expect(localStorage.getItem("unrelated")).toBe("keep");
    expect(Object.keys(localStorage).filter((k) => k.includes("ph_"))).toEqual([]);
    expect(Object.keys(sessionStorage).filter((k) => k.includes("ph_"))).toEqual([]);
    expect(document.cookie).not.toContain("ph_");

    trackPage("/en/case/sber");
    trackCaseEnd("sber");
    expect(ph.capture).not.toHaveBeenCalled();
  });

  it("can opt back in later in the same session", async () => {
    await grantConsent();
    denyConsent();
    ph.capture.mockClear();
    await grantConsent();
    expect(ph.init).toHaveBeenCalledTimes(1);
    expect(events()).toEqual(["$pageview"]);
  });
});
