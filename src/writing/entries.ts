import { getCases } from "../data/portfolio";
import type { Lang } from "../i18n/translations";
import { caseLink } from "../lib/url";
import { postLink } from "../lib/writingUrl";
import { getPosts } from "./posts";
import type { Category, CoverLive } from "./types";

/** One card on the Cases page and in the home Cases block: a post or a home-page case study. */
export interface CaseEntry {
  key: string;
  href: string;
  title: string;
  dek: string;
  category: Category;
  /** shown before the category: a post date or the case years */
  when: string;
  /** newest first; a post's YYYY-MM-DD or a case's last year */
  sortKey: string;
  /** path under public/ */
  image?: string;
  live?: { variant: CoverLive; fallback: string; mark?: string };
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`));
}

/** Cases page category of each home-page case study; the same in every language. */
export const CASE_CATEGORY: Record<string, Category> = {
  "sber-india-proto": "ai-tools",
  openprovider: "product-building",
  "clearscale-msp": "design-engineering",
  seligoai: "design-engineering",
};

const YEARS = /^\d{4}(?:\s*[-–]\s*\d{4})?$/;

export function getEntries(lang: Lang = "en"): CaseEntry[] {
  const posts: CaseEntry[] = getPosts().map((p) => ({
    key: `post:${p.slug}`,
    href: postLink(p.slug),
    title: p.title,
    dek: p.dek,
    category: p.category,
    when: formatDate(p.date),
    sortKey: p.date,
    image: p.thumb ?? p.cover,
    live:
      p.coverLive && p.cover && !p.thumb
        ? { variant: p.coverLive, fallback: p.cover, mark: p.coverMark }
        : undefined,
  }));

  const cases: CaseEntry[] = getCases().map((c) => {
    const years = c.meta.map(([, value]) => value).find((v) => YEARS.test(v)) ?? "";
    return {
      key: `case:${c.id}`,
      href: caseLink(c.id, lang),
      title: c.title,
      dek: c.description[0],
      category: CASE_CATEGORY[c.id] ?? "product-building",
      when: years.replace(/\s*[-–]\s*/, "–"),
      // "2026" sorts before "2026-11-03": a dated post of the same year comes first.
      sortKey: years.slice(-4),
      image: c.preview?.src,
    };
  });

  // Stable sort keeps the source order for equal keys.
  return [...posts, ...cases].sort((a, b) => (a.sortKey < b.sortKey ? 1 : a.sortKey > b.sortKey ? -1 : 0));
}
