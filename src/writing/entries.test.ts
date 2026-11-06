import { describe, expect, it } from "vitest";
import { getCases } from "../data/portfolio";
import { getPosts } from "./posts";
import { CASE_CATEGORY, getEntries, homeEntries } from "./entries";

describe("getEntries", () => {
  const entries = getEntries("en");

  it("lists every post and every home-page case once", () => {
    expect(entries).toHaveLength(getPosts().length + getCases().length);
    expect(new Set(entries.map((e) => e.key)).size).toBe(entries.length);
  });

  it("puts the newest first and links posts to /cases, case studies to /case", () => {
    const keys = entries.map((e) => e.sortKey);
    expect(keys).toEqual([...keys].sort().reverse());
    expect(entries.find((e) => e.key.startsWith("post:"))?.href).toMatch(/\/en\/cases\/[\w-]+\/$/);
    expect(entries.find((e) => e.key === "case:openprovider")).toMatchObject({
      href: expect.stringMatching(/\/en\/case\/openprovider\/$/),
      when: "2022–2025",
    });
  });

  it("shows a post's month and year, not the day", () => {
    expect(entries.find((e) => e.key.startsWith("post:"))?.when).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
  });

  it("has a category for every home-page case", () => {
    for (const c of getCases()) expect(CASE_CATEGORY[c.id]).toBeDefined();
  });
});

describe("homeEntries", () => {
  it("ends with the pinned case and keeps the limit", () => {
    const home = homeEntries(getEntries(), 4);
    expect(home).toHaveLength(4);
    expect(home[3].key).toBe("case:sber-india-proto");
    expect(new Set(home.map((e) => e.key)).size).toBe(4);
  });

  it("does not move a pinned case that is missing", () => {
    const rest = getEntries().filter((e) => e.key !== "case:sber-india-proto");
    expect(homeEntries(rest, 4)).toEqual(rest.slice(0, 4));
  });
});
