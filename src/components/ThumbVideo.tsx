import { useEffect, useRef } from "react";
import { assetUrl } from "../lib/url";

/**
 * A looping card video. It plays only while on screen in a visible tab; under reduced
 * motion it stays on its poster. On a card the link carries the meaning, so without a
 * `label` the video is hidden from screen readers.
 */
export function ThumbVideo({
  src,
  poster,
  className,
  label,
}: {
  src: string;
  poster: string;
  className?: string;
  /** set when no surrounding link carries the meaning */
  label?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // React doesn't render the attribute, and autoplay needs it
    const motion =
      typeof window.matchMedia === "function"
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
        : new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            update();
          });
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
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      src={assetUrl(src)}
      poster={assetUrl(poster)}
      loop
      muted
      playsInline
      preload="none"
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
