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
    expect(p.sections[1].html).toContain("<p>");
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

describe("getPosts", () => {
  it("returns an array", () => {
    expect(Array.isArray(getPosts())).toBe(true);
  });
});
