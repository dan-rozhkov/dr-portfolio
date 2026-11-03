import { describe, expect, it } from "vitest";
import { hashAction, parseRoute } from "./useRoute";

describe("parseRoute", () => {
  it("parses cases index", () => {
    expect(parseRoute("/en/cases/")).toEqual({ name: "cases", lang: "en", category: null });
  });
  it("keeps old /writing URLs on the cases routes", () => {
    expect(parseRoute("/en/writing/")).toEqual({ name: "cases", lang: "en", category: null });
    expect(parseRoute("/en/writing/qure/")).toEqual({ name: "post", slug: "qure", lang: "en" });
  });
  it("parses cases category", () => {
    expect(parseRoute("/en/cases", "?category=ai-tools")).toEqual({
      name: "cases",
      lang: "en",
      category: "ai-tools",
    });
  });
  it("parses post", () => {
    expect(parseRoute("/en/cases/pen-editor/")).toEqual({
      name: "post",
      slug: "pen-editor",
      lang: "en",
    });
  });
  it("parses jobs", () => {
    expect(parseRoute("/en/jobs/")).toEqual({ name: "jobs", lang: "en" });
  });
  it("keeps case and home", () => {
    expect(parseRoute("/en/case/openprovider")).toEqual({
      name: "case",
      id: "openprovider",
      lang: "en",
    });
    // /ru/ was removed; old /ru/ paths open the English page.
    expect(parseRoute("/ru/jobs/")).toEqual({ name: "jobs", lang: "en" });
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
