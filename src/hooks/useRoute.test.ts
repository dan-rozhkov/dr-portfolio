import { describe, expect, it } from "vitest";
import { hashAction, parseRoute } from "./useRoute";

describe("parseRoute", () => {
  it("parses writing index", () => {
    expect(parseRoute("/en/writing/")).toEqual({ name: "writing", lang: "en", category: null });
  });
  it("parses writing category and forces en", () => {
    expect(parseRoute("/ru/writing", "?category=ai-tools")).toEqual({
      name: "writing",
      lang: "en",
      category: "ai-tools",
    });
  });
  it("parses post", () => {
    expect(parseRoute("/en/writing/pen-editor/")).toEqual({
      name: "post",
      slug: "pen-editor",
      lang: "en",
    });
  });
  it("parses jobs", () => {
    expect(parseRoute("/ru/jobs/")).toEqual({ name: "jobs", lang: "en" });
  });
  it("keeps case and home", () => {
    expect(parseRoute("/en/case/openprovider")).toEqual({
      name: "case",
      id: "openprovider",
      lang: "en",
    });
    expect(parseRoute("/ru/")).toEqual({ name: "home", lang: "ru" });
  });
});

describe("hashAction", () => {
  it("scrolls in place when the element exists off the home page", () => {
    expect(hashAction(false, true)).toBe("scroll");
  });
  it("falls back to home when the element is missing off the home page", () => {
    expect(hashAction(false, false)).toBe("home");
  });
  it("leaves hash links to the browser on the home page", () => {
    expect(hashAction(true, true)).toBe("native");
    expect(hashAction(true, false)).toBe("native");
  });
});
