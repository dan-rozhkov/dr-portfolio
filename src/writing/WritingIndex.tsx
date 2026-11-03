import { getPosts } from "./posts";
import { filterPosts, isCategory } from "./filter";
import { CATEGORY_LABEL } from "./types";
import type { Category } from "./types";
import { postLink, writingLink } from "../lib/writingUrl";
import { BASE, assetUrl } from "../lib/url";
import { LiveCover } from "../components/LiveCover";

const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`));
}

export default function WritingIndex({ category }: { category: string | null }) {
  const all = getPosts();
  const active = isCategory(category) ? category : null;
  const posts = filterPosts(all, active);

  return (
    <main className="writing-page">
      <section className="grid-shell writing">
        <aside className="writing-side">
          <h1 className="writing-title">Cases</h1>
          <p>Products I designed and built, and the decisions behind them.</p>
          <ul className="writing-filter">
            <li>
              <a href={writingLink()} aria-current={active === null ? "page" : undefined}>
                All<span>{all.length}</span>
              </a>
            </li>
            {CATEGORIES.map((slug) => (
              <li key={slug}>
                <a href={writingLink(slug)} aria-current={active === slug ? "page" : undefined}>
                  {CATEGORY_LABEL[slug]}
                  <span>{all.filter((p) => p.category === slug).length}</span>
                </a>
              </li>
            ))}
          </ul>
          <a className="writing-rss" href={`${BASE}en/writing/rss.xml`}>
            RSS ↗
          </a>
        </aside>
        <div className="writing-stream">
          {posts.length === 0 ? (
            <p className="writing-empty">
              {all.length === 0 ? "First post is on its way." : "No posts in this category yet."}
            </p>
          ) : (
            posts.map((p, i) => {
              const image = p.thumb ?? p.cover;
              return (
                <article key={p.slug}>
                  <a href={postLink(p.slug)}>
                    {image && (
                      <div className="writing-thumb">
                        {p.coverLive && p.cover && !p.thumb ? (
                          <LiveCover
                            variant={p.coverLive}
                            fallback={p.cover}
                            mark={p.coverMark}
                            alt=""
                            loading={i === 0 ? "eager" : "lazy"}
                          />
                        ) : (
                          <img src={assetUrl(image)} alt="" loading={i === 0 ? "eager" : "lazy"} />
                        )}
                      </div>
                    )}
                    <div className="writing-meta">
                      {formatDate(p.date)} · {CATEGORY_LABEL[p.category]}
                    </div>
                    <h2>{p.title}</h2>
                    <p>{p.dek}</p>
                  </a>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
