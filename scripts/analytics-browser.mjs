// Run after npm run build, with wrangler dev --local --port 8798 running.
// Analytics requests are inspected and acknowledged locally. This script never sends them to PostHog.
import assert from "node:assert/strict";
import { chromium } from "playwright";

const local = process.env.ANALYTICS_TEST_ORIGIN || "http://localhost:8798";
const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const events = [];
    const unexpected = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await context.addInitScript(() => {
      if (location.hostname !== "drozhkov.com") return;
      localStorage.setItem("ph_old_posthog", "old-private-id");
      localStorage.setItem("dr_analytics_consent", "granted");
      sessionStorage.setItem("ph_old_window", "old-session-id");
      document.cookie = "ph_old=x; Path=/";
    });
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.hostname !== "drozhkov.com") {
        unexpected.push(request.url());
        return route.abort();
      }
      if (url.pathname === "/api/aggregate") {
        assert.equal(request.method(), "POST");
        const headers = await request.allHeaders();
        assert.equal(headers.cookie, undefined);
        assert.equal(headers.referer, undefined);
        assert.equal(url.search, "");
        const payload = request.postDataJSON();
        assert.deepEqual(
          Object.keys(payload).sort(),
          payload.channel ? ["channel", "event", "page"] : ["event", "page"],
        );
        assert.doesNotMatch(JSON.stringify(payload), /secret|private|@|utm_|[?#]/);
        events.push(payload);
        return route.fulfill({ status: 204 });
      }
      const response = await context.request.get(local + url.pathname + url.search, {
        maxRedirects: 0,
      });
      return route.fulfill({ response });
    });
    for (const path of [
      "/en/",
      "/en/case/seligoai/",
      "/en/cases/",
      "/en/cases/biscuit-pet/",
      "/en/jobs/",
    ]) {
      await page.goto(
        `https://drozhkov.com${path}?utm_source=secret&email=private%40example.com#secret`,
      );
      await page.waitForFunction(() => localStorage.getItem("ph_old_posthog") === null);
      assert.equal(
        await page
          .locator(
            '.consent, [aria-label="Analytics consent"], [aria-label="Согласие на аналитику"]',
          )
          .count(),
        0,
      );
      assert.equal(
        await page
          .getByRole("button", {
            name: /Accept analytics|Reject analytics|Настройки аналитики|Analytics settings/,
          })
          .count(),
        0,
      );
      assert.equal(await page.locator('a.contact-privacy[href="/privacy.html"]').count(), 1);
      assert.deepEqual(
        await page.evaluate(() => ({
          local: Object.keys(localStorage),
          session: Object.keys(sessionStorage),
          cookie: document.cookie,
        })),
        { local: [], session: [], cookie: "" },
      );
    }
    await page.goto("https://drozhkov.com/en/");
    await page.waitForFunction(() => localStorage.length === 0);
    // Exercise real delegated handlers without navigating to external services or downloading a CV.
    await page.evaluate(() => {
      for (const kind of ["resume", "contact-email", "contact-linkedin"]) {
        document.addEventListener("click", (event) => event.preventDefault(), { once: true });
        document
          .querySelector(`[data-analytics="${kind}"]`)
          .dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }),
          );
      }
    });
    await page.waitForTimeout(100);
    for (const event of ["$pageview", "case_viewed", "resume_clicked", "contact_clicked"])
      assert.ok(
        events.some((e) => e.event === event),
        event,
      );
    await page.screenshot({ path: `/tmp/dr-home-${viewport.width}.png` });
    // Check actual local asset redirects without the production-origin request mock.
    await context.unroute("**/*");
    await page.goto(`${local}/en/`);
    await page.locator(".contact-privacy").evaluate((link) => link.click());
    await page.waitForURL(
      (url) => /^\/privacy(?:\.html)?$/.test(url.pathname),
    );
    await page.getByRole("heading", { name: "Privacy", exact: true }).waitFor({ state: "visible" });
    assert.deepEqual(unexpected, []);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `/tmp/dr-privacy-${viewport.width}.png`, fullPage: true });
    console.log(
      JSON.stringify({
        viewport,
        inspectedEvents: events.length,
        banner: "absent",
        unexpectedExternalRequests: unexpected.length,
        storage: "empty",
        privacy: "rendered",
      }),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
