// Usage: node scripts/video-dims.mjs
// Writes src/data/video-dims.json: the pixel size of every original .mp4 under public/images,
// so <video> gets width/height before it loads (no layout shift, and native lazy loading
// can tell when the element nears the screen). scripts/encode-video.sh runs this at the end.
import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "public";
const OUT = "src/data/video-dims.json";

function mp4s(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return mp4s(p);
    return /\.mp4$/i.test(e.name) && !/\.hevc\.mp4$/i.test(e.name) ? [p] : [];
  });
}

const dims = {};
for (const file of mp4s(join(ROOT, "images")).sort()) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0", file],
    { encoding: "utf8" },
  ).trim();
  const [w, h] = out.split("x").map(Number);
  if (!w || !h) throw new Error(`no video size for ${file}: ${out}`);
  dims[relative(ROOT, file)] = [w, h];
}

writeFileSync(OUT, `${JSON.stringify(dims, null, 2)}\n`);
console.log(`${OUT}: ${Object.keys(dims).length} videos`);
