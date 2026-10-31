import { describe, expect, it } from "vitest";
import { parseRoute } from "./useRoute";

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
