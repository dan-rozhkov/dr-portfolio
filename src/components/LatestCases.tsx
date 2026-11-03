import { useEffect } from "react";
import { getCases } from "../data/portfolio";
import { getEntries } from "../writing/entries";
import CaseCard from "../writing/CaseCard";
import { casesLink } from "../lib/writingUrl";
import { caseLink } from "../lib/url";
import { useLang, useT } from "../i18n/context";

const SHOWN = 3;

/** The three newest cases on the home page, in the Cases-page card style. */
export default function LatestCases() {
  const t = useT();
  const lang = useLang();
  const all = getEntries(lang);
  const latest = all.slice(0, SHOWN);

  // Each case used to have its own home section: keep shared links like /en/#openprovider working.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && getCases().some((c) => c.id === id)) window.location.replace(caseLink(id, lang));
  }, [lang]);

  return (
    <section className="section home-cases snap-section" id="work">
      <div className="grid-shell home-cases-grid">
        <div className="home-cases-head">
          <h2>{t("cases.heading")}</h2>
          <a className="home-cases-all" href={casesLink()}>
            {t("cases.all")} <span>{all.length}</span> →
          </a>
        </div>
        <div className="home-cases-list">
          {latest.map((entry) => (
            <CaseCard entry={entry} key={entry.key} />
          ))}
        </div>
      </div>
    </section>
  );
}
