import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CaseSection } from "../data/portfolio";
import { useT } from "../i18n/context";
import { assetUrl } from "../lib/url";
import type { SubheadSection } from "./caseGroups";

function isVideo(src: string): boolean {
  return /\.(mp4|webm|mov)$/i.test(src);
}

export function Media({
  src,
  alt,
  aspect,
  loading = "lazy",
}: {
  src?: string;
  alt?: string;
  aspect?: string;
  loading?: "lazy" | "eager";
}) {
  if (!src) return <Placeholder aspect={aspect} />;
  if (isVideo(src)) {
    return (
      <video
        className="cs-image"
        src={assetUrl(src)}
        autoPlay
        loop
        muted
        playsInline
        aria-label={alt || ""}
      />
    );
  }
  return (
    <img
      className="cs-image"
      src={assetUrl(src)}
      alt={alt || ""}
      loading={loading}
    />
  );
}

function Placeholder({ aspect }: { aspect?: string }) {
  return (
    <div
      className="cs-image"
      style={{ aspectRatio: aspect || "16 / 9" }}
      aria-hidden="true"
    />
  );
}

/** `html` text is trusted, pre-rendered markup (paragraphs); plain text otherwise. */
function RichText({ text, html }: { text: string; html?: boolean }) {
  return html ? (
    <div className="cs-rich" dangerouslySetInnerHTML={{ __html: text }} />
  ) : (
    <p>{text}</p>
  );
}

export function Outcomes({
  stats,
  text,
  html,
  label,
}: {
  stats: [string, string][];
  text: string;
  html?: boolean;
  label: ReactNode;
}) {
  return (
    <div className="cs-row cs-outcomes">
      {label}
      <div className="cs-outcomes-stats">
        {stats.map(([value, name], i) => (
          <div className="cs-stat" key={`${value}-${i}`}>
            <div className="cs-stat-value">{value}</div>
            <div className="cs-stat-label">{name}</div>
          </div>
        ))}
      </div>
      {html ? (
        <div className="cs-outcomes-text" dangerouslySetInnerHTML={{ __html: text }} />
      ) : (
        <div className="cs-outcomes-text">{text}</div>
      )}
    </div>
  );
}

export function Subhead({ item, html }: { item: SubheadSection; html?: boolean }) {
  return (
    <div className="cs-row cs-subhead">
      <div className="cs-subhead-side">
        <h3>{item.title}</h3>
        <RichText text={item.text} html={html} />
      </div>
      <div className="cs-subhead-media">
        <Media src={item.src} alt={item.alt} aspect={item.aspect} />
      </div>
    </div>
  );
}

export function Section({ section }: { section: CaseSection }) {
  const t = useT();

  if (section.kind === "image") {
    return (
      <div className="cs-image-row">
        <Media
          src={section.src}
          alt={section.alt}
          aspect={section.aspect}
        />
      </div>
    );
  }

  if (section.kind === "outcomes") {
    return (
      <Outcomes
        stats={section.stats}
        text={section.text}
        label={<div className="cs-label">{t("case.outcomes")}</div>}
      />
    );
  }

  if (section.kind === "subhead") {
    return <Subhead item={section} />;
  }

  const textClass = section.kind === "logline" ? "cs-logline" : "cs-case-text";

  return (
    <div className="cs-row">
      {section.label ? (
        <div className="cs-label">{section.label}</div>
      ) : (
        <div className="cs-label cs-label-spacer" aria-hidden="true" />
      )}
      <div className={textClass}>{section.text}</div>
    </div>
  );
}

export function Slider({ items, html }: { items: SubheadSection[]; html?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = Math.max(0, Math.min(total, -rect.top));
      const progress = total > 0 ? scrolled / total : 0;
      const idx = Math.min(
        items.length - 1,
        Math.floor(progress * items.length + 0.0001)
      );
      setActive(idx);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className="cs-slider"
      style={{ height: `${items.length * 100}vh` }}
    >
      <div className="cs-slider-sticky">
        <div className="cs-slider-grid">
          <div className="cs-slider-text">
            {items.map((item, i) => (
              <div
                className={`cs-slider-slide${
                  i === active ? " is-active" : ""
                }${i < active ? " is-past" : ""}`}
                key={i}
                aria-hidden={i !== active}
              >
                <h3>{item.title}</h3>
                <RichText text={item.text} html={html} />
              </div>
            ))}
          </div>
          <div className="cs-slider-media">
            {items.map((item, i) => (
              <div
                className={`cs-slider-media-slide${
                  i === active ? " is-active" : ""
                }`}
                key={i}
                aria-hidden={i !== active}
              >
                <Media src={item.src} alt={item.alt} aspect={item.aspect} />
              </div>
            ))}
          </div>
          <div className="cs-slider-dots" aria-hidden="true">
            {items.map((_, i) => (
              <span
                className={`cs-dot${i === active ? " is-active" : ""}`}
                key={i}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Hidden with display:none on desktop, so only one copy is ever in the a11y tree. */}
      <div className="cs-slider-mobile">
        {items.map((item, i) => (
          <div className="cs-slider-pair" key={i}>
            <h3>{item.title}</h3>
            <RichText text={item.text} html={html} />
            <Media src={item.src} alt={item.alt} aspect={item.aspect} />
          </div>
        ))}
      </div>
    </div>
  );
}
