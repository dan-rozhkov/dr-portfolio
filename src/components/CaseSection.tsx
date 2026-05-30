import type { CaseSummary } from "../data/portfolio";
import { assetUrl, caseLink } from "../lib/url";
import { useT, useLang } from "../i18n/context";

export default function CaseSection({ item, first }: { item: CaseSummary; first: boolean }) {
  const t = useT();
  const lang = useLang();

  return (
    <section className="section case snap-section" id={item.id}>
      {first && <span id="work" aria-hidden="true" />}
      <article className="grid-shell case-grid">
        <div className="case-copy">
          <h2>{item.title}</h2>
          {item.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <dl className="case-meta">
            {item.meta.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <a
          className={`case-media ${
            item.preview
              ? "case-media-image"
              : item.variant === "mobile"
              ? "case-media-mobile"
              : "case-media-placeholder"
          }`}
          href={caseLink(item.id, lang)}
          data-cursor={t("case.viewCase")}
          aria-label={`${t("case.viewCase")} ${item.title}`}
        >
          {item.preview ? (
            <img
              src={assetUrl(item.preview.src)}
              alt={item.preview.alt}
              loading="lazy"
            />
          ) : item.variant === "mobile" ? (
            <div className="mobile-stack" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          ) : null}
        </a>

      </article>
    </section>
  );
}
