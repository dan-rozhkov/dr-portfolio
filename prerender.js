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

const BASE = "/dr-portfolio/";

function writePage(outPath, routePath) {
  const html = render(routePath);
  const full = template.replace(
    '<div id="root"></div>',
    `<div id="root">${html}</div>`
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, full);
  console.log("prerendered", routePath, "->", path.relative(distDir, outPath));
}

writePage(path.join(distDir, "index.html"), BASE);

for (const item of cases) {
  writePage(
    path.join(distDir, "case", item.id, "index.html"),
    `${BASE}case/${item.id}`
  );
}

// 404 fallback — copy home so unknown paths still hydrate the SPA.
fs.copyFileSync(
  path.join(distDir, "index.html"),
  path.join(distDir, "404.html")
);

// Clean up the SSR build output — not needed in the published site.
fs.rmSync(ssrDir, { recursive: true, force: true });
