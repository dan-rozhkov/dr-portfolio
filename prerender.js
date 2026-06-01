import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const ssrDir = path.join(__dirname, "dist-ssr");

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
const { render, cases } = await import(
  pathToFileURL(path.join(ssrDir, "entry-server.js")).href
);

const SITE_ORIGIN = "https://dan-rozhkov.github.io";
const LANGS = ["en", "ru"];

function writePage(outPath, routePath) {
  const html = render(routePath);
  const lang = routePath.startsWith("/ru") ? "ru" : "en";
  const full = template
    .replace('<html lang="en">', `<html lang="${lang}">`)
    .replace(
      '<div id="root"></div>',
      `<div id="root">${html}</div>`
    );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, full);
  console.log("prerendered", routePath, "->", path.relative(distDir, outPath));
}

for (const lang of LANGS) {
  // render() calls setDataLang internally via extractLang(path)
  // Home page
  writePage(path.join(distDir, lang, "index.html"), `/${lang}/`);

  // Case pages (case IDs are identical across languages)
  const allCases = cases();
  for (const item of allCases) {
    writePage(
      path.join(distDir, lang, "case", item.id, "index.html"),
      `/${lang}/case/${item.id}`
    );
  }
}

// Root redirect to /en/
const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script>location.replace((navigator.language||"").toLowerCase().startsWith("ru")?"/ru/":"/en/")</script>
  <meta http-equiv="refresh" content="0;url=/en/">
  <link rel="canonical" href="${SITE_ORIGIN}/en/">
  <title>Danil Rozhkov</title>
</head>
<body>
  <noscript><p><a href="/en/">English</a> · <a href="/ru/">Русский</a></p></noscript>
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

// Sitemap with hreflang
const today = new Date().toISOString().slice(0, 10);
const sitemapUrls = [];

function sitemapEntry(loc, alternates) {
  const links = alternates
    .map((a) => `<xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`)
    .join("");
  return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod>${links}</url>`;
}

// Root with x-default
sitemapUrls.push(
  sitemapEntry(`${SITE_ORIGIN}/`, [
    { lang: "x-default", href: `${SITE_ORIGIN}/` },
    ...LANGS.map((l) => ({ lang: l, href: `${SITE_ORIGIN}/${l}/` })),
  ])
);

// Home + case pages for each language
for (const lang of LANGS) {
  sitemapUrls.push(
    sitemapEntry(`${SITE_ORIGIN}/${lang}/`,
      LANGS.map((l) => ({ lang: l, href: `${SITE_ORIGIN}/${l}/` }))
    )
  );
}

const allCases = cases();
for (const item of allCases) {
  for (const lang of LANGS) {
    sitemapUrls.push(
      sitemapEntry(`${SITE_ORIGIN}/${lang}/case/${item.id}`,
        LANGS.map((l) => ({ lang: l, href: `${SITE_ORIGIN}/${l}/case/${item.id}` }))
      )
    );
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls.join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
console.log("wrote sitemap.xml");

// Update robots.txt to point to new sitemap location
const robots = `User-agent: *
Allow: /en/
Allow: /ru/
Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
fs.writeFileSync(path.join(distDir, "robots.txt"), robots);
console.log("wrote robots.txt");

// Clean up the SSR build output
fs.rmSync(ssrDir, { recursive: true, force: true });
