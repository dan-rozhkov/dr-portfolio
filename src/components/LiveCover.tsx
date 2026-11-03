import { assetUrl } from "../lib/url";
import type { CoverLive } from "../writing/types";
import { LiquidGradient } from "./LiquidGradient";
import { SwirlCover } from "./SwirlCover";

/**
 * A cover drawn live with a mark centred on it: the Sideform landing's gradient, or
 * Qure's dithered swirl. The static `fallback` image sits underneath and stays visible
 * until the first frame is drawn, and for good where the canvas can't draw.
 */
export function LiveCover({
  fallback,
  mark,
  alt,
  loading = "lazy",
  variant = "liquid-gradient",
}: {
  variant?: CoverLive;
  fallback: string;
  mark?: string;
  alt: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <div
      className={`live-cover live-cover--${variant}`}
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
    >
      <img className="live-cover-fallback" src={assetUrl(fallback)} alt="" loading={loading} />
      {variant === "qure-swirl" ? (
        <SwirlCover className="live-cover-canvas" />
      ) : (
        <LiquidGradient className="live-cover-canvas" />
      )}
      {mark && <img className="live-cover-mark" src={assetUrl(mark)} alt="" />}
    </div>
  );
}
