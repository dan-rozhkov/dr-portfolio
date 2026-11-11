import { CATEGORY_LABEL } from "./types";
import type { CaseEntry } from "./entries";
import { assetUrl } from "../lib/url";
import { LiveCover } from "../components/LiveCover";
import { ThumbVideo } from "../components/ThumbVideo";

export default function CaseCard({
  entry,
  eager = false,
  heading: Title = "h2",
}: {
  entry: CaseEntry;
  eager?: boolean;
  /** h3 when the list sits under an h2 (the home page) */
  heading?: "h2" | "h3";
}) {
  const loading = eager ? "eager" : "lazy";
  return (
    <article className="case-card">
      <a href={entry.href}>
        {entry.image && (
          <div className={entry.video ? "writing-thumb writing-thumb--wide" : "writing-thumb"}>
            {entry.video ? (
              <ThumbVideo src={entry.video} poster={entry.image} lazy={!eager} />
            ) : entry.live ? (
              <LiveCover
                variant={entry.live.variant}
                fallback={entry.live.fallback}
                mark={entry.live.mark}
                alt=""
                loading={loading}
              />
            ) : (
              <img src={assetUrl(entry.image)} alt="" loading={loading} />
            )}
          </div>
        )}
        <div className="writing-meta">
          {entry.when ? `${entry.when} · ` : ""}
          {CATEGORY_LABEL[entry.category]}
        </div>
        <Title className="case-card-title">{entry.title}</Title>
        <p>{entry.dek}</p>
      </a>
    </article>
  );
}
