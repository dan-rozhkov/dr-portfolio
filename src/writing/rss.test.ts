import { describe, expect, it } from "vitest";
import { buildRss } from "./rss";

const posts = [
  { slug: "a", title: "Tom & Jerry", dek: "First <dek>", date: "2026-10-28" },
  { slug: "b", title: "Second", dek: "Two", date: "2026-10-01" },
];

describe("buildRss", () => {
  const xml = buildRss(posts, "https://x.test");
  it("is RSS 2.0 with one item per post", () => {
    expect(xml).toContain('<rss version="2.0">');
    expect(xml.match(/<item>/g)).toHaveLength(2);
    expect(xml).toContain("<title>Danil Rozhkov — Writing</title>");
  });
  it("escapes xml", () => {
    expect(xml).toContain("Tom &amp; Jerry");
    expect(xml).toContain("First &lt;dek&gt;");
  });
  it("uses link as guid and RFC-822 date", () => {
    expect(xml).toContain("<guid>https://x.test/en/writing/a/</guid>");
    expect(xml).toContain("<pubDate>Wed, 28 Oct 2026 00:00:00 GMT</pubDate>");
  });
  it("handles zero posts", () => {
    expect(buildRss([], "https://x.test")).not.toContain("<item>");
  });
});
