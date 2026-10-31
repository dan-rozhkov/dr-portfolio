import { describe, expect, it } from "vitest";
import { getPosts, parsePost, readMinutes, sortPosts } from "./posts";

const valid = `---
title: Parallel agents
dek: How I split work.
date: 2026-10-01
category: ai-tools
tldr:
  - one
  - two
  - three
stack: [Claude Code]
links:
  - label: Repo
    url: https://example.com
---
Intro paragraph.

## Split execution

Body text here.
`;

describe("parsePost", () => {
  it("parses a valid post", () => {
    const p = parsePost(valid, "x");
    expect(p.title).toBe("Parallel agents");
    expect(p.category).toBe("ai-tools");
    expect(p.date).toBe("2026-10-01");
    expect(p.tldr.length).toBe(3);
    expect(p.sections[0].label).toBe("");
    expect(p.sections[1].label).toBe("Split execution");
    expect(p.sections[1].blocks[0]).toMatchObject({ kind: "prose" });
    expect(JSON.stringify(p.sections[1].blocks)).toContain("<p>");
  });

  it("does not split on ## lines inside fenced code blocks", () => {
    const md = valid.replace(
      "Body text here.",
      "Before.\n\n```md\n## Install\nnpm i\n```\n\n~~~\n## Tilde\n~~~\n\nAfter.",
    );
    const p = parsePost(md, "x");
    expect(p.sections.map((s) => s.label)).toEqual(["", "Split execution"]);
    const html = JSON.stringify(p.sections[1].blocks);
    expect(html).toContain("## Install");
    expect(html).toContain("## Tilde");
  });

  it("reads optional ogImage", () => {
    expect(parsePost(valid, "x").ogImage).toBeUndefined();
    const withOg = valid.replace("stack:", "ogImage: /img/og.jpg\nstack:");
    expect(parsePost(withOg, "x").ogImage).toBe("/img/og.jpg");
  });

  it("throws on missing title", () => {
    expect(() => parsePost(valid.replace("title: Parallel agents\n", ""), "x")).toThrow(
      /x\.md: missing title/,
    );
  });

  it("throws on bad category", () => {
    expect(() => parsePost(valid.replace("ai-tools", "blog"), "x")).toThrow(/x\.md: bad category/);
  });

  it("throws on bad date", () => {
    expect(() => parsePost(valid.replace("2026-10-01", "soon"), "x")).toThrow(/x\.md: bad date/);
  });
});

describe("readMinutes", () => {
  it("rounds up words / 220, min 1", () => {
    expect(readMinutes("word ".repeat(441))).toBe(3);
    expect(readMinutes("")).toBe(1);
  });
});

describe("sortPosts", () => {
  it("orders newest first", () => {
    const a = parsePost(valid, "a");
    const b = parsePost(valid.replace("2026-10-01", "2026-11-01"), "b");
    expect(sortPosts([a, b]).map((p) => p.slug)).toEqual(["b", "a"]);
  });
});

describe("directives", () => {
  const withBody = (body: string) => valid.replace(/Intro paragraph\.[\s\S]*$/, body);
  const blocks = (body: string) => parsePost(withBody(body), "x").sections.flatMap((s) => s.blocks);

  it("parses logline", () => {
    expect(blocks("## A\n\n:::logline\nBig  idea\nhere.\n:::\n")).toEqual([
      { kind: "logline", text: "Big idea here." },
    ]);
  });

  it("parses slider with two items", () => {
    const b = blocks(
      "## A\n\n:::slider\n### One\nFirst text.\n\n![alt one](/a.png)\n\n### Two\nSecond.\n![v](/b.mp4)\n:::\n",
    );
    expect(b).toEqual([
      {
        kind: "slider",
        items: [
          { title: "One", text: "First text.", src: "/a.png", alt: "alt one" },
          { title: "Two", text: "Second.", src: "/b.mp4", alt: "v" },
        ],
      },
    ]);
  });

  it("parses outcomes", () => {
    const b = blocks("## A\n\n:::outcomes\n- 3x — faster\n- 40% — fewer bugs\n\nSummary text.\n:::\n");
    expect(b).toEqual([
      {
        kind: "outcomes",
        stats: [
          ["3x", "faster"],
          ["40%", "fewer bugs"],
        ],
        text: "Summary text.",
      },
    ]);
  });

  it("parses full-width image and keeps other images in prose", () => {
    const b = blocks('## A\n\nText.\n\n![wide](/w.png "full")\n\n![small](/s.png)\n');
    expect(b.map((x) => x.kind)).toEqual(["prose", "image", "prose"]);
    expect(b[1]).toEqual({ kind: "image", src: "/w.png", alt: "wide" });
    expect(JSON.stringify(b[2])).toContain("<img");
  });

  it("ignores directives inside fenced code", () => {
    const b = blocks("## A\n\n```md\n:::slider\n### x\n```\n\nAfter.\n");
    expect(b.map((x) => x.kind)).toEqual(["prose"]);
  });

  it("fails on an unclosed directive, naming file and line", () => {
    expect(() => parsePost(withBody("## A\n\n:::slider\n### One\n"), "my-post")).toThrow(
      /my-post\.md: unclosed ":::slider" directive opened at line 17/,
    );
  });
});

describe("getPosts", () => {
  it("returns an array", () => {
    expect(Array.isArray(getPosts())).toBe(true);
  });
});
