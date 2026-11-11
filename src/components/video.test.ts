import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { keepsOriginalOnly, videoSize, videoSources } from "./video";

describe("videoSources", () => {
  it("offers H.265, VP9, then the H.264 original for an .mp4", () => {
    const s = videoSources("/images/a/clip.mp4");
    expect(s.map((x) => x.src.replace(/^.*\/images\//, ""))).toEqual([
      "a/clip.hevc.mp4",
      "a/clip.webm",
      "a/clip.mp4",
    ]);
    expect(s[0].type).toContain("hvc1");
  });

  it("passes other files through as one source", () => {
    expect(videoSources("x/clip.webm")).toHaveLength(1);
    expect(videoSources("x/clip.hevc.mp4")).toHaveLength(1);
    expect(videoSources("/images/writing/biscuit-pet/home.mp4")).toHaveLength(1);
  });
});

function mp4s(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return mp4s(p);
    return /\.mp4$/i.test(e.name) && !/\.hevc\.mp4$/i.test(e.name) ? [p] : [];
  });
}

describe("public videos", () => {
  it("every .mp4 has its .hevc.mp4 and .webm (run scripts/encode-video.sh)", () => {
    const missing = mp4s("public/images")
      .filter((p) => !keepsOriginalOnly(p.replace(/^public\//, "")))
      .flatMap((p) =>
        [p.replace(/\.mp4$/i, ".hevc.mp4"), p.replace(/\.mp4$/i, ".webm")].filter((v) => !existsSync(v)),
      );
    expect(missing).toEqual([]);
  });

  it("original-only folders carry no variants", () => {
    const extra = mp4s("public/images")
      .filter((p) => keepsOriginalOnly(p.replace(/^public\//, "")))
      .flatMap((p) => [p.replace(/\.mp4$/i, ".hevc.mp4"), p.replace(/\.mp4$/i, ".webm")].filter((v) => existsSync(v)));
    expect(extra).toEqual([]);
  });

  it("every .mp4 has its size recorded (run scripts/video-dims.mjs)", () => {
    const missing = mp4s("public/images")
      .map((p) => p.replace(/^public\//, ""))
      .filter((p) => !videoSize(p));
    expect(missing).toEqual([]);
  });
});

describe("videoSize", () => {
  it("reads a recorded size with or without a leading slash", () => {
    const [first] = mp4s("public/images").map((p) => p.replace(/^public\//, ""));
    expect(videoSize(first)).toEqual(videoSize(`/${first}`));
    expect(videoSize(first)?.width).toBeGreaterThan(0);
  });

  it("returns nothing for an unknown file", () => {
    expect(videoSize("/images/none.mp4")).toBeUndefined();
  });
});
