import { useEffect } from "react";
import Contact from "../Contact";
import type { Post } from "./types";
import { assetUrl } from "../lib/url";
import { writingLink } from "../lib/writingUrl";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`));
}

function repoName(url: string, fallback: string): string {
  const last = url.replace(/[?#].*$/, "").split("/").filter(Boolean).pop();
  return last && !/^https?:$/.test(last) ? last : fallback;
}

function isVideo(src: string): boolean {
  return /\.(mp4|webm)$/i.test(src);
}

function Cover({ post }: { post: Post }) {
  const src = post.cover;
  return (
    <div className="post-cover">
      {src ? (
        isVideo(src) ? (
          <video
            className="cs-image"
            src={assetUrl(src)}
            autoPlay
            loop
            muted
            playsInline
            aria-label={post.title}
          />
        ) : (
          <img className="cs-image" src={assetUrl(src)} alt={post.title} />
        )
      ) : (
        <div className="post-cover-empty" aria-hidden="true" />
      )}
    </div>
  );
}

export default function PostPage({ post }: { post: Post | undefined }) {
  const slug = post?.slug;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <main className="post-page">
        <section className="cs-title-grid post-head">
          <h1 className="cs-title-name">Post not found</h1>
          <div className="cs-title-intro">
            <a className="post-back" href={writingLink()}>
              All writing
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
        <a className="post-back-link" href={writingLink()}>
          ← All writing
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
                <dt>Code</dt>
                <dd>
                  {post.links.map((l, i) => (
                    <span key={l.url}>
                      {i > 0 && ", "}
                      <a href={l.url} target="_blank" rel="noopener noreferrer">
                        {repoName(l.url, l.label)} ↗
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
            <div className="cs-row" key={i}>
              {s.label ? (
                <h2 className="cs-label">{s.label}</h2>
              ) : (
                <div className="cs-label cs-label-spacer" aria-hidden="true" />
              )}
              <div
                className="cs-case-text post-body"
                dangerouslySetInnerHTML={{ __html: s.html }}
              />
            </div>
          ))}
        </div>
      </article>
      <Contact />
    </main>
  );
}
