import { marked } from "marked";
import { parse as parseYaml } from "yaml";
import { CATEGORY_LABEL } from "./types";
import type { Category, Post, PostSection } from "./types";

export function readMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function normaliseDate(v: unknown): string | undefined {
  let s: string | undefined;
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return undefined;
    s = v.toISOString().slice(0, 10);
  } else if (typeof v === "string") {
    s = v.trim();
  }
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? undefined : s;
}

function splitSections(body: string): PostSection[] {
  const parts = body.split(/^## /m);
  const sections: PostSection[] = [];
  const intro = parts[0].trim();
  if (intro) sections.push({ label: "", html: marked.parse(intro, { async: false }) });
  for (const part of parts.slice(1)) {
    const nl = part.indexOf("\n");
    const label = (nl === -1 ? part : part.slice(0, nl)).trim();
    const md = nl === -1 ? "" : part.slice(nl + 1).trim();
    sections.push({ label, html: marked.parse(md, { async: false }) });
  }
  return sections;
}

export function parsePost(raw: string, slug: string): Post {
  const fail = (problem: string): never => {
    throw new Error(`${slug}.md: ${problem}`);
  };
  const m = FRONT_MATTER.exec(raw);
  if (!m) return fail("missing front-matter");
  let fm: Record<string, unknown>;
  try {
    const parsed: unknown = parseYaml(m[1], { schema: "core" });
    fm = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return fail("invalid front-matter");
  }
  const title = str(fm.title) ?? fail("missing title");
  const dek = str(fm.dek) ?? fail("missing dek");
  if (fm.date === undefined) fail("missing date");
  const date = normaliseDate(fm.date) ?? fail("bad date");
  if (fm.category === undefined) fail("missing category");
  if (typeof fm.category !== "string" || !Object.hasOwn(CATEGORY_LABEL, fm.category)) fail("bad category");
  const tldr = strList(fm.tldr);
  if (tldr.length === 0) fail("missing tldr");

  const links = Array.isArray(fm.links)
    ? fm.links.flatMap((l: unknown) => {
        const o = (l ?? {}) as Record<string, unknown>;
        const label = str(o.label);
        const url = str(o.url);
        return label && url ? [{ label, url }] : [];
      })
    : [];

  const body = m[2];
  return {
    slug,
    title,
    dek,
    date,
    category: fm.category as Category,
    tldr,
    stack: strList(fm.stack),
    links,
    cover: str(fm.cover),
    ogImage: str(fm.ogImage),
    readMinutes: readMinutes(body),
    sections: splitSections(body),
  };
}

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

const files = import.meta.glob("/content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

let cached: Post[] | undefined;

export function getPosts(): Post[] {
  cached ??= loadPosts();
  return cached;
}

function loadPosts(): Post[] {
  const posts = Object.entries(files).flatMap(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    return slug.startsWith("_") ? [] : [parsePost(raw, slug)];
  });
  return sortPosts(posts);
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}
