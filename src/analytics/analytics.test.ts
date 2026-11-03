// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://drozhkov.com/en/"}
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __testing,
  initAnalytics,
  trackPage,
  trackCaseEnd,
  trackResumeClick,
  trackContactClick,
  handleAnalyticsClick,
  handleAnalyticsAuxClick,
} from "./analytics";

const send = vi.fn(async () => new Response(null, { status: 204 }));
beforeEach(() => {
  __testing.reset();
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal("fetch", send);
  send.mockClear();
});
afterEach(() => vi.unstubAllGlobals());
const payloads = () =>
  send.mock.calls.map((call) =>
    JSON.parse((call as unknown as [string, RequestInit])[1].body as string),
  );

describe("identifier-free browser collection", () => {
  it("sends fixed page/case/CV/contact events and deduplicates effects and case ends", () => {
    initAnalytics();
    trackPage("/en/case/seligoai/?utm_source=private@example.com#secret");
    trackPage("/en/case/seligoai");
    trackCaseEnd("seligoai");
    trackCaseEnd("seligoai");
    trackContactClick("email");
    trackResumeClick();
    expect(payloads()).toEqual([
      { event: "$pageview", page: "/en/case/seligoai" },
      { event: "case_viewed", page: "/en/case/seligoai" },
      { event: "case_end_reached", page: "/en/case/seligoai" },
      { event: "contact_clicked", page: "/en/case/seligoai", channel: "email" },
      { event: "resume_clicked", page: "/en/case/seligoai" },
    ]);
    for (const call of send.mock.calls) {
      expect(call).toEqual([
        "/api/aggregate",
        expect.objectContaining({
          credentials: "omit",
          referrerPolicy: "no-referrer",
          redirect: "error",
          mode: "same-origin",
          keepalive: true,
        }),
      ]);
    }
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).toBe("");
  });

  it("drops unknown paths and mismatched cases, including personal data in paths", () => {
    trackPage("/en/writing/private-person");
    trackContactClick("email");
    expect(send).not.toHaveBeenCalled();
    trackPage("/en/case/seligoai");
    trackCaseEnd("other");
    expect(payloads()).toHaveLength(2);
  });

  it("never sends link addresses or link text, including middle clicks", () => {
    trackPage("/en");
    send.mockClear();
    const a = document.createElement("a");
    a.href = "mailto:private@example.com?body=secret";
    a.dataset.analytics = "contact-email";
    a.textContent = "private";
    handleAnalyticsClick({ target: a } as unknown as MouseEvent);
    a.dataset.analytics = "resume";
    handleAnalyticsAuxClick({ target: a, button: 1 } as unknown as MouseEvent);
    expect(payloads()).toEqual([
      { event: "contact_clicked", page: "/en", channel: "email" },
      { event: "resume_clicked", page: "/en" },
    ]);
  });

  it("respects DNT and GPC", () => {
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "1" });
    trackPage("/en");
    expect(send).not.toHaveBeenCalled();
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: null });
    Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: true });
    trackPage("/ru");
    expect(send).not.toHaveBeenCalled();
    Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: false });
  });

  it("never collects on previews or localhost", () => {
    window.history.replaceState({}, "", "/en");
    // Host policy is checked separately because jsdom cannot navigate to another origin.
    expect(isAnalyticsHost("localhost")).toBe(false);
    expect(isAnalyticsHost("preview.workers.dev")).toBe(false);
    expect(isAnalyticsHost("drozhkov.com.attacker.com")).toBe(false);
  });

  it("deletes legacy stores without adding markers or touching unrelated data", () => {
    for (const storage of [localStorage, sessionStorage]) {
      storage.setItem("ph_old_posthog", "private-id");
      storage.setItem("__ph_opt_in_out_old", "1");
      storage.setItem("dr_analytics_consent", "denied");
      storage.setItem("theme", "dark");
    }
    document.cookie = "ph_old=x; Path=/";
    document.cookie = "theme=dark; Path=/";
    initAnalytics();
    initAnalytics();
    for (const storage of [localStorage, sessionStorage])
      expect(Object.keys(storage)).toEqual(["theme"]);
    expect(document.cookie).not.toContain("ph_");
    expect(document.cookie).toContain("theme=dark");
    document.cookie = "theme=; Max-Age=0; Path=/";
  });

  it("handles blocked stores and failed networking without breaking the page", async () => {
    const remove = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    localStorage.setItem("ph_old", "x");
    expect(() => initAnalytics()).not.toThrow();
    remove.mockRestore();
    send.mockRejectedValueOnce(new Error("offline"));
    expect(() => trackPage("/en")).not.toThrow();
    await Promise.resolve();
  });
});
import { isAnalyticsHost } from "./config";
