// Usage: npm run shots -- /en/writing/ [more paths]
// Needs `vite preview --port 4173` running. Set PW_CHROMIUM to use a custom browser binary.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const ORIGIN = process.env.SHOTS_ORIGIN ?? "http://localhost:4173";
const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.error("Usage: node scripts/screenshots.mjs <url-path>...");
  process.exit(2);
}

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const slug = (p) => p.replace(/#.*$/, "").replace(/[?&=]+/g, "-").replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "home";

mkdirSync("shots", { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
let failed = false;

for (const path of paths) {
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(ORIGIN + path, { waitUntil: "networkidle" });
    const file = `shots/${slug(path)}-${vp.name}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
    if (vp.name === "mobile") {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      if (overflow) {
        console.error(`Horizontal scroll on mobile: ${path}`);
        failed = true;
      }
    }
    await page.close();
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
