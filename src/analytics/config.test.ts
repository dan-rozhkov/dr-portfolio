import { describe, expect, it } from "vitest";
import type { CaptureResult } from "posthog-js";
import { buildConfig, isAnalyticsHost, sanitizeUrl } from "./config";

describe("isAnalyticsHost", () => {
  it("allows only the production domain", () => {
    expect(isAnalyticsHost("drozhkov.com")).toBe(true);
    expect(isAnalyticsHost("www.drozhkov.com")).toBe(true);
    expect(isAnalyticsHost("localhost")).toBe(false);
    expect(isAnalyticsHost("127.0.0.1")).toBe(false);
    expect(isAnalyticsHost("dr-portfolio.example.workers.dev")).toBe(false);
  });
});

describe("sanitizeUrl", () => {
  it("keeps UTM tags and drops every other param and the hash", () => {
    expect(
      sanitizeUrl(
        "https://drozhkov.com/en/writing/?category=ai&utm_source=li&email=a%40b.c&utm_campaign=x#contact",
      ),
    ).toBe("https://drozhkov.com/en/writing/?utm_source=li&utm_campaign=x");
  });

  it("leaves non-URLs alone", () => {
    expect(sanitizeUrl("$direct")).toBe("$direct");
  });
});

describe("before_send", () => {
  it("sanitizes URL and referrer properties, including $set_once", () => {
    const beforeSend = buildConfig().before_send as (e: CaptureResult) => CaptureResult;
    const event = {
      event: "$pageview",
      uuid: "u",
      properties: {
        $current_url: "https://drozhkov.com/en/?q=secret&utm_medium=social",
        $referrer: "https://www.google.com/search?q=danil",
        $referring_domain: "www.google.com",
        utm_medium: "social",
      },
      $set_once: { $initial_current_url: "https://drozhkov.com/en/?token=abc" },
    } as unknown as CaptureResult;
    const out = beforeSend(event);
    expect(out.properties.$current_url).toBe("https://drozhkov.com/en/?utm_medium=social");
    expect(out.properties.$referrer).toBe("https://www.google.com/search");
    expect(out.properties.$referring_domain).toBe("www.google.com");
    expect(out.properties.utm_medium).toBe("social");
    expect(out.$set_once?.$initial_current_url).toBe("https://drozhkov.com/en/");
  });
});
