// @vitest-environment jsdom
/**
 * Runs the real posthog-js SDK with all network APIs stubbed and checks what
 * would leave the browser: nothing before consent or after rejection, events
 * after acceptance, nothing again after withdrawal.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const requests: string[] = [];
const bodies: string[] = [];

function record(url: unknown, body?: unknown) {
  requests.push(String(url));
  if (typeof body === "string") bodies.push(body);
}

beforeAll(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: unknown, init?: { body?: unknown }) => {
      record(url, init?.body);
      return new Response('{"status":1}', { status: 200 });
    }),
  );
  class FakeXHR {
    url = "";
    withCredentials = false;
    readyState = 4;
    status = 200;
    responseText = '{"status":1}';
    onreadystatechange: (() => void) | null = null;
    open(_m: string, url: string) {
      this.url = url;
    }
    setRequestHeader() {}
    send(body?: unknown) {
      record(this.url, body);
      this.onreadystatechange?.();
    }
  }
  vi.stubGlobal("XMLHttpRequest", FakeXHR);
  window.fetch = globalThis.fetch;
  window.XMLHttpRequest = FakeXHR as unknown as typeof XMLHttpRequest;
  Object.defineProperty(navigator, "sendBeacon", {
    configurable: true,
    value: vi.fn((url: string, body?: unknown) => {
      record(url, body);
      return true;
    }),
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const posthogRequests = () => requests.filter((u) => u.includes("posthog.com"));

/** The SDK batches events and flushes every ~3 s. */
const flush = (ms = 3500) => new Promise((resolve) => setTimeout(resolve, ms));

describe("real SDK network behaviour", () => {
  it("sends nothing before a choice, nothing after reject, events after accept, nothing after withdrawal", async () => {
    const analytics = await import("./analytics");
    analytics.__testing.reset({ enabledHost: () => true });
    localStorage.clear();
    window.history.replaceState({}, "", "/en/case/sber");

    // No choice yet.
    analytics.initAnalytics();
    analytics.trackPage("/en/case/sber");
    await flush(200);
    expect(posthogRequests()).toEqual([]);
    expect(Object.keys(localStorage).filter((k) => k.includes("ph_"))).toEqual([]);
    expect(document.cookie).toBe("");

    // Reject.
    analytics.denyConsent();
    analytics.trackPage("/en/case/sber");
    await flush(200);
    expect(posthogRequests()).toEqual([]);

    // Accept.
    await analytics.grantConsent();
    analytics.trackCaseEnd("sber");
    await flush();
    const sent = posthogRequests();
    expect(sent.length).toBeGreaterThan(0);
    expect(sent.every((u) => u.startsWith("https://eu.i.posthog.com/"))).toBe(true);
    expect(document.cookie).toBe("");

    // Withdraw.
    analytics.denyConsent();
    const before = posthogRequests().length;
    window.history.replaceState({}, "", "/en/writing/");
    analytics.trackPage("/en/writing/");
    await flush();
    expect(posthogRequests().length).toBe(before);
    expect(Object.keys(localStorage).filter((k) => k.includes("ph_"))).toEqual([]);
    expect(Object.keys(sessionStorage).filter((k) => k.includes("ph_"))).toEqual([]);
  }, 20_000);
});
