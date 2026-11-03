// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import PostPage from "./PostPage";
import { I18nProvider } from "../i18n/context";
import type { Post } from "./types";

const post: Post = {
  slug: "demo",
  title: "Demo post title",
  dek: "Short dek",
  date: "2026-10-28",
  category: "design-engineering",
  tldr: ["First bullet", "Second bullet"],
  stack: ["React", "Vite"],
  links: [{ label: "GitHub", url: "https://example.com/repo" }],
  readMinutes: 4,
  sections: [
    { label: "", blocks: [{ kind: "prose", html: "<p>Intro text</p>" }] },
    { label: "Context", blocks: [{ kind: "prose", html: "<p>Context text</p>" }] },
    { label: "Outcome", blocks: [{ kind: "prose", html: "<p>Outcome text</p>" }] },
  ],
};

const render = (p?: Post) =>
  renderToString(
    <I18nProvider lang="en">
      <PostPage post={p} />
    </I18nProvider>,
  );

describe("PostPage", () => {
  it("renders title, tldr, meta and section labels", () => {
    const html = render(post);
    expect(html).toContain("Demo post title");
    expect(html).toContain("First bullet");
    expect(html).toContain("Second bullet");
    expect(html).toContain("Published");
    expect(html).toContain("28 Oct 2026");
    expect(html).toContain("4 min");
    expect(html).toContain("React, Vite");
    expect(html).toContain("https://example.com/repo");
    expect(html).toContain("Context");
    expect(html).toContain("Outcome");
    expect(html).toContain("Outcome text");
  });

  it("omits meta rows without data", () => {
    const html = render({ ...post, stack: [], links: [] });
    expect(html).not.toContain("Stack");
    expect(html).not.toContain("Code");
  });

  it("titles repo links Code and site links Links with their host", () => {
    const repo = render({ ...post, links: [{ label: "GitHub", url: "https://github.com/me/tool" }] });
    expect(repo).toContain("<dt>Code</dt>");
    expect(repo).toContain(">tool<");
    const site = render({ ...post, links: [{ label: "Site", url: "https://www.quretests.com/download?x=1" }] });
    expect(site).toContain("<dt>Links</dt>");
    expect(site).toContain(">quretests.com<");
  });

  it("renders a not-found block for an unknown post", () => {
    const html = render(undefined);
    expect(html).toContain("Post not found");
    expect(html).toContain("/en/writing/");
  });

  it("renders rich blocks with the case-study markup", () => {
    const html = render({
      ...post,
      sections: [
        {
          label: "Rich",
          blocks: [
            { kind: "logline", html: "Big statement" },
            {
              kind: "slider",
              items: [
                { title: "One", text: "First", src: "/a.png", alt: "a" },
                { title: "Two", text: "Second", src: "/b.png", alt: "b" },
              ],
            },
            { kind: "image", src: "/wide.png", alt: "wide" },
            { kind: "outcomes", stats: [["3x", "faster"]], html: "Done" },
          ],
        },
      ],
    });
    for (const c of ["cs-logline", "cs-slider", "cs-slider-sticky", "cs-slider-slide", "cs-slider-dots", "cs-image-row", "cs-outcomes", "cs-stat-value"])
      expect(html).toContain(c);
    expect(html).toContain("Big statement");
    expect(html).toContain("Rich");
  });

  it("uses the section label for a leading outcomes block, with no extra label row", () => {
    const html = render({
      ...post,
      sections: [
        { label: "Results", blocks: [{ kind: "outcomes", stats: [["3x", "faster"]], html: "Done" }] },
      ],
    });
    expect(html.match(/Results/g)).toHaveLength(1);
    expect(html).not.toContain("Outcomes");
  });

  it("renders a one-item slider as a static subhead", () => {
    const html = render({
      ...post,
      sections: [
        { label: "S", blocks: [{ kind: "slider", items: [{ title: "Solo", text: "<p>x</p>", src: "/a.png", alt: "a" }] }] },
      ],
    });
    expect(html).toContain("cs-subhead");
    expect(html).not.toContain("cs-slider-sticky");
  });

  it("loads the cover eagerly", () => {
    const html = render({ ...post, cover: "/img/c.webp" });
    expect(html).toMatch(/<img[^>]*loading="eager"/);
  });

  it("exposes the mobile slider copy to assistive tech", () => {
    const html = render({
      ...post,
      sections: [
        {
          label: "S",
          blocks: [
            {
              kind: "slider",
              items: [
                { title: "A", text: "<p>1</p>" },
                { title: "B", text: "<p>2</p>" },
              ],
            },
          ],
        },
      ],
    });
    expect(html).not.toMatch(/cs-slider-mobile"[^>]*aria-hidden/);
  });

  it("renders nothing for a missing cover", () => {
    expect(render(post)).not.toContain("post-cover");
  });
});
