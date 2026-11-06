import { useEffect } from "react";
import { getCases } from "../data/portfolio";
import CasesList from "../writing/CasesList";
import { caseLink } from "../lib/url";

/** The home page Cases block: the Cases page layout with the newest four cards. */
export default function LatestCases() {
  // Each case used to have its own home section: keep shared links like /en/#openprovider working.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && getCases().some((c) => c.id === id)) window.location.replace(caseLink(id));
  }, []);

  return (
    <section className="section home-cases snap-section" id="work">
      <CasesList category={null} limit={4} heading="h2" />
    </section>
  );
}
