import { assetUrl } from "../lib/url";
import type { CoverLive } from "../writing/types";
import { LiquidGradient, type GradientName } from "./LiquidGradient";

const PRESET: Record<CoverLive, GradientName> = {
  "liquid-gradient": "sideform",
  "qure-gradient": "qure",
};

/**
 * A cover drawn live: the landing's gradient with a mark centred on it. The static
 * `fallback` image sits underneath and stays visible until the first frame is drawn,
 * and for good where WebGL2 is unavailable.
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
      className={`live-cover live-cover--${PRESET[variant]}`}
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
    >
      <img className="live-cover-fallback" src={assetUrl(fallback)} alt="" loading={loading} />
      <LiquidGradient className="live-cover-canvas" preset={PRESET[variant]} />
      {mark && <img className="live-cover-mark" src={assetUrl(mark)} alt="" />}
    </div>
  );
}
