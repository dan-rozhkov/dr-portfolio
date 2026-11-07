import { useRef } from "react";
import { assetUrl } from "../lib/url";
import { useViewportPlayback, videoSources } from "./video";

/**
 * A looping card video. It plays only while on screen in a visible tab; under reduced
 * motion it stays on its poster. The card link carries the meaning, so the video is hidden
 * from screen readers.
 */
export function ThumbVideo(props: { src: string; poster: string }) {
  // key: a browser picks among <source> children only on first load, so a new src needs a new element
  return <ThumbVideoPlayer key={props.src} {...props} />;
}

function ThumbVideoPlayer({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useViewportPlayback(ref, { respectReducedMotion: true });
  return (
    <video
      ref={ref}
      poster={assetUrl(poster)}
      loop
      muted
      playsInline
      preload="none"
      aria-hidden="true"
    >
      {videoSources(src).map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
}
