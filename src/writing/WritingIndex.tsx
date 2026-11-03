import { filterByCategory, isCategory } from "./filter";
import { CATEGORY_LABEL } from "./types";
import type { Category } from "./types";
import { getEntries } from "./entries";
import CaseCard from "./CaseCard";
import { casesLink } from "../lib/writingUrl";
import { BASE } from "../lib/url";

const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

export default function WritingIndex({ category }: { category: string | null }) {
  const all = getEntries("en");
  const active = isCategory(category) ? category : null;
  const entries = filterByCategory(all, active);

  return (
    <main className="writing-page">
      <section className="grid-shell writing">
        <aside className="writing-side">
          <h1 className="writing-title">Cases</h1>
          <p>Products I designed and built, and the decisions behind them.</p>
          <ul className="writing-filter">
            <li>
              <a href={casesLink()} aria-current={active === null ? "page" : undefined}>
                All<span>{all.length}</span>
              </a>
            </li>
            {CATEGORIES.map((slug) => (
              <li key={slug}>
                <a href={casesLink(slug)} aria-current={active === slug ? "page" : undefined}>
                  {CATEGORY_LABEL[slug]}
                  <span>{all.filter((e) => e.category === slug).length}</span>
                </a>
              </li>
            ))}
          </ul>
          <a className="writing-rss" href={`${BASE}en/cases/rss.xml`}>
            RSS ↗
          </a>
        </aside>
        <div className="writing-stream">
          {entries.length === 0 ? (
            <p className="writing-empty">No cases in this category yet.</p>
          ) : (
            entries.map((e, i) => <CaseCard entry={e} eager={i === 0} key={e.key} />)
          )}
        </div>
      </section>
    </main>
  );
}
