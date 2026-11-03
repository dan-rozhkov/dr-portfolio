import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const ssrDir = path.join(__dirname, "dist-ssr");

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

/**
 * Vite names the SSR bundle `entry-server.js`, but a plugin can add a hash and
 * an `assets/` subfolder (`assets/entry-server-BqANBvsP.js`). Look in both
 * places so the prerender step never depends on the bundle name.
 */
function findSsrEntry(dir) {
  const direct = path.join(dir, "entry-server.js");
  if (fs.existsSync(direct)) return direct;

  const assetsDir = path.join(dir, "assets");
  if (fs.existsSync(assetsDir)) {
    const hashed = fs
      .readdirSync(assetsDir)
      .find((name) => name.startsWith("entry-server") && name.endsWith(".js"));
    if (hashed) return path.join(assetsDir, hashed);
  }

  throw new Error(
    `SSR entry not found in ${dir}. Contents: ${
      fs.existsSync(dir) ? fs.readdirSync(dir).join(", ") : "(directory missing)"
    }`
  );
}

const { render, cases, pageMeta, postSlugs, rss } = await import(
  pathToFileURL(findSsrEntry(ssrDir)).href
);


const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://drozhkov.com").replace(
  /\/+$/,
  ""
);

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

/** Absolute URL for a route. Every page is served from a directory, so it ends with a slash. */
function pageUrl(routePath) {
  const path = routePath.endsWith("/") ? routePath : `${routePath}/`;
  return `${SITE_ORIGIN}${path}`;
}

function writePage(outPath, routePath) {
  const html = render(routePath);
  const lang = "en";
  const meta = pageMeta(routePath);
  const title = meta.title;
  let full = template
    .replace('<html lang="en">', `<html lang="${lang}">`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root">${html}</div>`
    );

  const tokens = {
    "%PAGE_URL%": escapeAttr(pageUrl(routePath)),
    "%PAGE_TITLE%": escapeAttr(title),
    "%SITE_ORIGIN%": SITE_ORIGIN,
    "%PAGE_DESCRIPTION%": escapeAttr(meta.description),
    "%OG_DESCRIPTION%": escapeAttr(meta.ogDescription),
    "%OG_IMAGE%": escapeAttr(`${SITE_ORIGIN}${meta.image}`),
    "%OG_TYPE%": meta.type,
    "%OG_LOCALE%": "en_US",
  };
  for (const [token, value] of Object.entries(tokens)) {
    full = full.split(token).join(value);
  }

  const leftover = full.match(/%[A-Z_]+%/);
  if (leftover) {
    throw new Error(`Unreplaced token ${leftover[0]} in ${outPath}`);
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, full);
  console.log("prerendered", routePath, "->", path.relative(distDir, outPath));
}

// Home page and case pages
const allCases = cases();
writePage(path.join(distDir, "en", "index.html"), "/en/");
for (const item of allCases) {
  writePage(
    path.join(distDir, "en", "case", item.id, "index.html"),
    `/en/case/${item.id}`
  );
}

// Cases index, posts, jobs, RSS
const allPosts = postSlugs();
writePage(path.join(distDir, "en", "cases", "index.html"), "/en/cases/");
for (const slug of allPosts) {
  writePage(
    path.join(distDir, "en", "cases", slug, "index.html"),
    `/en/cases/${slug}/`
  );
}
writePage(path.join(distDir, "en", "jobs", "index.html"), "/en/jobs/");
const feed = rss(SITE_ORIGIN);
fs.writeFileSync(path.join(distDir, "en", "cases", "rss.xml"), feed);
console.log("wrote en/cases/rss.xml");

// /en/writing/ was the old address of /en/cases/: keep old links and feed readers working.
// (The removed Russian version, /ru/*, redirects to /en/* through public/_redirects.)
function writeRedirect(outPath, target) {
  const url = `${SITE_ORIGIN}${target}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>
  <meta http-equiv="refresh" content="0;url=${escapeAttr(target)}">
  <link rel="canonical" href="${escapeAttr(url)}">
  <meta name="robots" content="noindex">
  <title>Danil Rozhkov</title>
</head>
<body><p><a href="${escapeAttr(target)}">${escapeHtml(url)}</a></p></body>
</html>
`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log("redirect", path.relative(distDir, outPath), "->", target);
}
writeRedirect(path.join(distDir, "en", "writing", "index.html"), "/en/cases/");
for (const slug of allPosts) {
  writeRedirect(path.join(distDir, "en", "writing", slug, "index.html"), `/en/cases/${slug}/`);
}
fs.writeFileSync(path.join(distDir, "en", "writing", "rss.xml"), feed);

// Root redirect to /en/
const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script>location.replace("/en/")</script>
  <meta http-equiv="refresh" content="0;url=/en/">
  <link rel="canonical" href="${SITE_ORIGIN}/en/">
  <title>Danil Rozhkov</title>
</head>
<body>
  <noscript><p><a href="/en/">Danil Rozhkov</a></p></noscript>
</body>
</html>
`;
fs.writeFileSync(path.join(distDir, "index.html"), redirectHtml);
console.log("wrote root redirect -> /en/");

// 404 fallback
fs.copyFileSync(
  path.join(distDir, "en", "index.html"),
  path.join(distDir, "404.html")
);

// Sitemap
const today = new Date().toISOString().slice(0, 10);
const sitemapUrls = [
  `/en/`,
  ...allCases.map((item) => `/en/case/${item.id}/`),
  `/en/cases/`,
  ...allPosts.map((slug) => `/en/cases/${slug}/`),
  `/en/jobs/`,
].map((route) => `  <url><loc>${pageUrl(route)}</loc><lastmod>${today}</lastmod></url>`);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
console.log("wrote sitemap.xml");

// Update robots.txt to point to new sitemap location
const robots = `User-agent: *
Allow: /en/
Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
fs.writeFileSync(path.join(distDir, "robots.txt"), robots);
console.log("wrote robots.txt");

// Clean up the SSR build output
fs.rmSync(ssrDir, { recursive: true, force: true });
