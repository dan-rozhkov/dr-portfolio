import { describe, expect, it } from "vitest";
import { filterByCategory } from "./filter";
import type { Post } from "./types";

const mk = (slug: string, category: Post["category"]): Post => ({
  slug,
  title: slug,
  dek: "",
  date: "2026-01-01",
  category,
  tldr: ["x"],
  stack: [],
  links: [],
  readMinutes: 1,
  sections: [],
});

const posts = [mk("a", "ai-tools"), mk("b", "design-engineering"), mk("c", "ai-tools")];

describe("filterByCategory", () => {
  it("returns only the matching category", () => {
    expect(filterByCategory(posts, "ai-tools").map((p) => p.slug)).toEqual(["a", "c"]);
  });
  it("returns all for null", () => {
    expect(filterByCategory(posts, null)).toHaveLength(3);
  });
  it("returns all for an unknown category", () => {
    expect(filterByCategory(posts, "nope")).toHaveLength(3);
  });
});
