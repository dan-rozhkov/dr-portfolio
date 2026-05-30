import { useEffect, useRef, useState } from "react";
import Contact from "./Contact";
import type { CaseSection, CaseStudy as CaseStudyType } from "./data/portfolio";
import { useT } from "./i18n/context";

function imageUrl(src: string): string {
  return `${import.meta.env.BASE_URL}${src.replace(/^\/+/, "")}`;
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

interface CaseImageProps {
  src?: string;
  alt?: string;
  aspect?: string;
  loading?: "lazy" | "eager";
}

function CaseImage({ src, alt, aspect, loading = "lazy" }: CaseImageProps) {
  if (!src) {
    return <Placeholder aspect={aspect} />;
  }

  return (
    <img
      className="cs-image"
      src={imageUrl(src)}
      alt={alt || ""}
      loading={loading}
    />
  );
}

function Section({ section }: { section: CaseSection }) {
  const t = useT();

  if (section.kind === "image") {
    return (
      <div className="cs-image-row">
        <CaseImage
          src={section.src}
          alt={section.alt}
          aspect={section.aspect}
        />
      </div>
    );
  }

  if (section.kind === "outcomes") {
    return (
      <div className="cs-row cs-outcomes">
        <div className="cs-label">{t("case.outcomes")}</div>
        <div className="cs-outcomes-stats">
          {section.stats.map(([value, label]) => (
            <div className="cs-stat" key={value}>
              <div className="cs-stat-value">{value}</div>
              <div className="cs-stat-label">{label}</div>
            </div>
          ))}
        </div>
        <div className="cs-outcomes-text">{section.text}</div>
      </div>
    );
  }

  if (section.kind === "subhead") {
    return (
      <div className="cs-row cs-subhead">
        <div className="cs-subhead-side">
          <h3>{section.title}</h3>
          <p>{section.text}</p>
        </div>
        <div className="cs-subhead-media">
          <Placeholder aspect={section.aspect || "4 / 3"} />
        </div>
      </div>
    );
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

type SubheadSection = Extract<CaseSection, { kind: "subhead" }>;

function Slider({ items }: { items: SubheadSection[] }) {
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
                <p>{item.text}</p>
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
                <Placeholder aspect={item.aspect || "4 / 3"} />
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
      <div className="cs-slider-mobile" aria-hidden="true">
        {items.map((item, i) => (
          <div className="cs-slider-pair" key={i}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <Placeholder aspect={item.aspect || "4 / 3"} />
          </div>
        ))}
      </div>
    </div>
  );
}

type Group =
  | { kind: "slider"; items: SubheadSection[] }
  | { kind: "single"; section: CaseSection };

function groupSections(sections: CaseSection[]): Group[] {
  const groups: Group[] = [];
  let buffer: SubheadSection[] = [];
  const flush = () => {
    if (buffer.length === 0) return;
    if (buffer.length > 1) {
      groups.push({ kind: "slider", items: buffer });
    } else {
      groups.push({ kind: "single", section: buffer[0] });
    }
    buffer = [];
  };

  for (const s of sections) {
    if (s.kind === "subhead") {
      buffer.push(s);
    } else {
      flush();
      groups.push({ kind: "single", section: s });
    }
  }
  flush();
  return groups;
}

export default function CaseStudy({ study }: { study: CaseStudyType }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [study.id]);

  const meta = study.meta.filter(([label]) => label.toLowerCase() !== "scope");
  const groups = groupSections(study.sections);

  return (
    <main className="case-study">
      <header className="cs-title-block">
        <div className="cs-title-grid">
          <h1 className="cs-title-name">{study.title}</h1>
          <div className="cs-title-intro">{study.intro}</div>
          <dl className="cs-title-meta">
            {meta.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div
        className="cs-hero"
        style={study.heroBackground ? { background: study.heroBackground } : undefined}
      >
        <CaseImage
          src={study.heroImage}
          alt={study.heroImageAlt}
          aspect="3840 / 1579"
          loading="eager"
        />
      </div>

      <div className="cs-sections">
        {groups.map((group, i) =>
          group.kind === "slider" ? (
            <Slider items={group.items} key={i} />
          ) : (
            <Section section={group.section} key={i} />
          )
        )}
      </div>

      <Contact />
    </main>
  );
}
