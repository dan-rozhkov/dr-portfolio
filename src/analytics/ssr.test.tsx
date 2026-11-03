// @vitest-environment node
import { describe, expect, it } from "vitest";
import { render } from "../entry-server";

describe("prerender with analytics", () => {
  it("renders without window and without the consent panel", () => {
    for (const path of ["/en/", "/ru/", "/en/case/sber-india-proto", "/en/cases/"]) {
      const html = render(path);
      expect(html).not.toContain('class="consent"');
      expect(html).toContain("contact-privacy");
    }
  });

  it("does not load the SDK on the server", async () => {
    const analytics = await import("./analytics");
    analytics.initAnalytics();
    analytics.trackPage("/en/");
    expect(render("/en/")).toContain('href="/privacy.html#en"');
    expect(render("/ru/")).toContain('href="/privacy.html#ru"');
  });
});
