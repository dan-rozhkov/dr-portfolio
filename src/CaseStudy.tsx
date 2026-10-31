import { useEffect } from "react";
import Contact from "./Contact";
import type { CaseStudy as CaseStudyType } from "./data/portfolio";
import { CaseImage, Section, Slider } from "./components/caseBlocks";
import { groupSections } from "./components/caseGroups";

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
