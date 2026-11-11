import { useEffect } from "react";
import type { RefObject } from "react";
import { assetUrl } from "../lib/url";
import VIDEO_DIMS from "../data/video-dims.json";

export interface VideoSource {
  src: string;
  type: string;
}

const DIMS: Record<string, number[] | undefined> = VIDEO_DIMS;

/**
 * Pixel size of a public video, from src/data/video-dims.json (scripts/video-dims.mjs).
 * Set as width/height on <video>, it reserves the right box before the file loads.
 */
export function videoSize(src: string): { width: number; height: number } | undefined {
  const dims = DIMS[src.replace(/^\/+/, "")];
  return dims ? { width: dims[0], height: dims[1] } : undefined;
}

/**
 * Native lazy loading for <video>: the browser holds back the poster and `preload` until
 * the element nears the screen. Chrome 150+; other browsers ignore the attribute and keep
 * following `preload`. Spread onto <video>, since React's types don't list it yet.
 */
export function lazyVideoProps(lazy: boolean): Record<string, string> {
  return lazy ? { loading: "lazy" } : {};
}

/**
 * Folders whose videos ship as the H.264 original only. Biscuit's fur loses its fine
 * strands at the shared settings, and a quality that keeps them saves almost nothing.
 */
export const ORIGINAL_ONLY_DIRS = ["images/writing/biscuit-pet/"];

export function keepsOriginalOnly(src: string): boolean {
  const path = src.replace(/^\/+/, "");
  return ORIGINAL_ONLY_DIRS.some((dir) => path.startsWith(dir));
}

/**
 * Every other `name.mp4` (H.264) ships with `name.hevc.mp4` (H.265) and `name.webm` (VP9),
 * made by scripts/encode-video.sh. The browser takes the first it can play: H.265 on
 * Safari and Chrome with a hardware decoder, VP9 on the rest, H.264 as the last resort.
 * The H.265 codec string names level 5.0 so 1920×1200 at 60 fps passes the check.
 */
export function videoSources(src: string): VideoSource[] {
  if (!/\.mp4$/i.test(src) || /\.hevc\.mp4$/i.test(src) || keepsOriginalOnly(src)) {
    return [{ src: assetUrl(src), type: /\.webm$/i.test(src) ? "video/webm" : "video/mp4" }];
  }
  const base = src.replace(/\.mp4$/i, "");
  return [
    { src: assetUrl(`${base}.hevc.mp4`), type: 'video/mp4; codecs="hvc1.1.6.L150.90"' },
    { src: assetUrl(`${base}.webm`), type: 'video/webm; codecs="vp9"' },
    { src: assetUrl(src), type: "video/mp4" },
  ];
}

/**
 * Play a muted looping video only while it is near the screen in a visible tab, so
 * videos further down the page don't download until the reader gets close.
 * With `respectReducedMotion` it stays paused under reduced motion.
 */
export function useViewportPlayback(
  ref: RefObject<HTMLVideoElement | null>,
  { respectReducedMotion = false, rootMargin = "0px" } = {},
) {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // React doesn't render the attribute, and autoplay needs it
    const motion =
      respectReducedMotion && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    let inView = typeof IntersectionObserver === "undefined";
    const update = () => {
      if (inView && !document.hidden && !motion?.matches) void video.play().catch(() => {});
      else video.pause();
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
              update();
            },
            { rootMargin },
          );
    observer?.observe(video);
    motion?.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("pageshow", update);
    update();
    return () => {
      observer?.disconnect();
      motion?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pageshow", update);
    };
  }, [ref, respectReducedMotion, rootMargin]);
}
