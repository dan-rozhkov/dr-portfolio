import { useEffect, useRef } from "react";
import { trackCaseEnd } from "./analytics/analytics";
import Contact from "./Contact";
import type { CaseStudy as CaseStudyType } from "./data/portfolio";
import { Media, Section, Slider } from "./components/caseBlocks";
import { groupSections } from "./components/caseGroups";

export default function CaseStudy({ study }: { study: CaseStudyType }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [study.id]);

  // Report reaching the end of the case (the last section scrolled into view).
  useEffect(() => {
    const el = endRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver((entries) => {
      // Report the case end once per pageview.
      if (entries.some((e) => e.isIntersecting)) trackCaseEnd(study.id);
    });
    observer.observe(el);
    return () => observer.disconnect();
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
        <Media
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
      <div className="cs-end" ref={endRef} aria-hidden="true" />

      <Contact />
    </main>
  );
}
