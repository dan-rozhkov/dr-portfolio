import { filterByCategory, isCategory } from "./filter";
import { CATEGORY_LABEL } from "./types";
import type { Category } from "./types";
import { getEntries } from "./entries";
import CaseCard from "./CaseCard";
import { casesLink } from "../lib/writingUrl";
import { BASE } from "../lib/url";

const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

/**
 * The Cases layout: title, filters and RSS on the left, case cards on the right.
 * The Cases page shows every card; the home page shows the newest few and a link to the rest.
 */
export default function CasesList({
  category,
  limit,
  heading: Heading = "h1",
}: {
  category: string | null;
  /** show only the newest few, with a link to the full Cases page */
  limit?: number;
  heading?: "h1" | "h2";
}) {
  const all = getEntries();
  const active = isCategory(category) ? category : null;
  const filtered = filterByCategory(all, active);
  const compact = limit !== undefined;
  const entries = compact ? filtered.slice(0, limit) : filtered;
  const counts = new Map<Category, number>();
  for (const e of all) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  // On the home page the filters lead to the Cases page; nothing there is the current page.
  const current = (slug: Category | null) =>
    !compact && active === slug ? ("page" as const) : undefined;

  return (
    <div className={`grid-shell writing${compact ? " writing--compact" : ""}`}>
      {compact ? (
        // The home page shows only the cards; the title and filters live on the Cases page.
        <Heading className="visually-hidden">Cases</Heading>
      ) : (
        <aside className="writing-side">
          <Heading className="writing-title">Cases</Heading>
          <p>Products I designed and built, and the decisions behind them.</p>
          <ul className="writing-filter">
            <li>
              <a
                href={casesLink()}
                aria-current={current(null)}
                className={active === null ? "is-active" : undefined}
              >
                All<span>{all.length}</span>
              </a>
            </li>
            {CATEGORIES.map((slug) => (
              <li key={slug}>
                <a
                  href={casesLink(slug)}
                  aria-current={current(slug)}
                  className={active === slug ? "is-active" : undefined}
                >
                  {CATEGORY_LABEL[slug]}
                  <span>{counts.get(slug) ?? 0}</span>
                </a>
              </li>
            ))}
          </ul>
          <a className="writing-rss" href={`${BASE}en/cases/rss.xml`}>
            RSS ↗
          </a>
        </aside>
      )}
      <div className="writing-stream">
        {entries.length === 0 ? (
          <p className="writing-empty">No cases in this category yet.</p>
        ) : (
          entries.map((e, i) => (
            <CaseCard
              entry={e}
              eager={!compact && i === 0}
              heading={Heading === "h1" ? "h2" : "h3"}
              key={e.key}
            />
          ))
        )}
        {compact && (
          <a className="home-cases-all" href={casesLink()}>
            <span className="home-cases-label">
              All cases <span>{all.length}</span>
            </span>
            {/* The line stretches to the button's width; the head stays at the right end. */}
            <svg className="home-cases-arrow" height="16" aria-hidden="true">
              <line x1="0" y1="8" x2="100%" y2="8" />
              <svg x="100%" overflow="visible">
                <path d="M-8 1 L-1 8 L-8 15" />
              </svg>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
