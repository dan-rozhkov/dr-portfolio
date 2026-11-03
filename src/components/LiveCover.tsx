import { assetUrl } from "../lib/url";
import { LiquidGradient } from "./LiquidGradient";

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
}: {
  fallback: string;
  mark?: string;
  alt: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <div
      className="live-cover"
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
    >
      <img className="live-cover-fallback" src={assetUrl(fallback)} alt="" loading={loading} />
      <LiquidGradient className="live-cover-canvas" />
      {mark && <img className="live-cover-mark" src={assetUrl(mark)} alt="" />}
    </div>
  );
}
