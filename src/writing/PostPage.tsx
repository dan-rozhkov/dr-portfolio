import Contact from "../Contact";
import type { Post, PostBlock, PostSection } from "./types";
import { Media, Outcomes, Section, Slider, Subhead } from "../components/caseBlocks";
import { casesLink } from "../lib/writingUrl";
import { LiveCover } from "../components/LiveCover";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`));
}

const isRepo = (url: string) => /^https?:\/\/(www\.)?github\.com\//.test(url);

/** Visible text for a meta link: the repo name for GitHub, the host for any other site. */
function linkText(url: string, fallback: string): string {
  if (isRepo(url)) return repoName(url, fallback);
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return fallback;
  }
}

function repoName(url: string, fallback: string): string {
  const last = url
    .replace(/[?#].*$/, "")
    .split("/")
    .filter(Boolean)
    .pop();
  return last && !/^https?:$/.test(last) ? last : fallback;
}

function Cover({ post }: { post: Post }) {
  if (!post.cover) return null;
  if (post.coverLive) {
    return (
      <div className="post-cover">
        <LiveCover variant={post.coverLive} fallback={post.cover} mark={post.coverMark} alt={post.title} loading="eager" />
      </div>
    );
  }
  return (
    <div className="post-cover">
      <Media src={post.cover} alt={post.title} loading="eager" />
    </div>
  );
}

function Label({ label }: { label: string }) {
  return label ? (
    <h2 className="cs-label">{label}</h2>
  ) : (
    <div className="cs-label cs-label-spacer" aria-hidden="true" />
  );
}

function Block({
  block,
  label,
  outcomesLabel,
}: {
  block: PostBlock;
  label: string;
  outcomesLabel?: string;
}) {
  switch (block.kind) {
    case "prose":
      return (
        <div className="cs-row">
          <Label label={label} />
          <div
            className="cs-case-text post-body"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        </div>
      );
    case "logline":
      return (
        <div className="cs-row">
          <Label label={label} />
          <div className="cs-logline" dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      );
    case "image":
      return <Section section={{ kind: "image", src: block.src, alt: block.alt }} />;
    case "outcomes":
      return (
        <Outcomes
          stats={block.stats}
          text={block.html}
          html
          label={<Label label={outcomesLabel ?? ""} />}
        />
      );
    case "slider": {
      const items = block.items.map((it) => ({ kind: "subhead" as const, ...it }));
      return items.length === 1 ? <Subhead item={items[0]} html /> : <Slider items={items} html />;
    }
  }
}

/** The label goes on the first row that has a label slot; otherwise on a row of its own. */
function SectionBlocks({ section }: { section: PostSection }) {
  const first = section.blocks[0];
  const labelled = first?.kind === "prose" || first?.kind === "logline";
  const inOutcomes = first?.kind === "outcomes";
  return (
    <section className="post-section">
      {!labelled && !inOutcomes && section.label && (
        <div className="cs-row">
          <Label label={section.label} />
        </div>
      )}
      {section.blocks.map((block, i) => (
        <Block
          block={block}
          label={i === 0 && labelled ? section.label : ""}
          outcomesLabel={i === 0 && inOutcomes ? section.label : ""}
          key={i}
        />
      ))}
    </section>
  );
}

export default function PostPage({ post }: { post: Post | undefined }) {
  if (!post) {
    return (
      <main className="post-page">
        <section className="cs-title-grid post-head">
          <h1 className="cs-title-name">Post not found</h1>
          <div className="cs-title-intro">
            <a className="post-back" href={casesLink()}>
              All cases
            </a>
          </div>
        </section>
        <Contact />
      </main>
    );
  }

  return (
    <main className="post-page">
      <article>
        <a className="post-back-link" href={casesLink()}>
          ← All cases
        </a>
        <header className="cs-title-grid post-head">
          <h1 className="cs-title-name">{post.title}</h1>
          <div className="cs-title-intro">
            <div className="post-label">TL;DR</div>
            <ul className="post-tldr">
              {post.tldr.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <dl className="cs-title-meta">
            <div>
              <dt>Published</dt>
              <dd>{formatDate(post.date)}</dd>
            </div>
            <div>
              <dt>Read</dt>
              <dd>{`${post.readMinutes} min`}</dd>
            </div>
            {post.stack.length > 0 && (
              <div>
                <dt>Stack</dt>
                <dd>{post.stack.join(", ")}</dd>
              </div>
            )}
            {post.links.length > 0 && (
              <div>
                <dt>{post.links.every((l) => isRepo(l.url)) ? "Code" : "Links"}</dt>
                <dd>
                  {post.links.map((l, i) => (
                    <span key={l.url}>
                      {i > 0 && ", "}
                      <a href={l.url} target="_blank" rel="noopener noreferrer">
                        {linkText(l.url, l.label)} ↗
                      </a>
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </header>

        <Cover post={post} />

        <div className="cs-sections post-sections">
          {post.sections.map((s, i) => (
            <SectionBlocks section={s} key={i} />
          ))}
        </div>
      </article>
      <Contact />
    </main>
  );
}
