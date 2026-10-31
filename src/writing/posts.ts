import { Marked } from "marked";
import type { Token, TokensList } from "marked";
import { parse as parseYaml } from "yaml";
import { assetUrl } from "../lib/url";
import { CATEGORY_LABEL } from "./types";
import type { Category, Post, PostBlock, PostSection, PostSliderItem } from "./types";

export function readMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

/** Words a reader actually reads: no directive markers, image markdown or link URLs. */
function proseWords(body: string): string {
  return body
    .replace(/^:::.*$/gm, " ")
    .replace(/^ {0,3}\[[^\]]+\]:\s+\S.*$/gm, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<https?:[^>]*>/g, " ");
}

const md = new Marked({
  renderer: {
    image({ href, title, text }) {
      const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      const src = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href) ? href : assetUrl(href);
      return `<img src="${esc(src)}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ""}>`;
    },
  },
});

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

type Chunk =
  | { type: "md"; text: string }
  | { type: "dir"; name: string; lines: string[]; line: number };
interface RawSection {
  label: string;
  chunks: Chunk[];
}

const DIRECTIVES = ["logline", "slider", "outcomes"];

/**
 * Walk the body line by line (fence-aware) into `##` sections made of
 * markdown chunks and `:::name … :::` directives. `firstLine` is the 1-based
 * file line of the first body line, for error messages.
 */
function tokenize(body: string, firstLine: number, fail: (m: string) => never): RawSection[] {
  const sections: RawSection[] = [{ label: "", chunks: [] }];
  let md: string[] = [];
  let dir: { name: string; lines: string[]; line: number } | null = null;
  let fence: string | null = null;
  const flushMd = () => {
    if (md.some((l) => l.trim())) sections[sections.length - 1].chunks.push({ type: "md", text: md.join("\n") });
    md = [];
  };
  body.split("\n").forEach((line, i) => {
    const lineNo = firstLine + i;
    const f = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (f) {
      if (fence === null) fence = f[1];
      else if (f[1][0] === fence[0] && f[1].length >= fence.length && line.trim() === f[1]) fence = null;
    }
    if (fence === null && !f) {
      if (dir) {
        if (/^:::\s*$/.test(line)) {
          sections[sections.length - 1].chunks.push({ type: "dir", ...dir });
          dir = null;
        } else {
          dir.lines.push(line);
        }
        return;
      }
      const d = /^:::([a-z]+)\s*$/.exec(line);
      if (d) {
        if (!DIRECTIVES.includes(d[1])) fail(`unknown directive ":::${d[1]}" at line ${lineNo}`);
        flushMd();
        dir = { name: d[1], lines: [], line: lineNo };
        return;
      }
      if (/^:::\s*$/.test(line)) fail(`stray ":::" at line ${lineNo}`);
      if (line.startsWith("## ")) {
        flushMd();
        sections.push({ label: line.slice(3).trim(), chunks: [] });
        return;
      }
    }
    if (dir) dir.lines.push(line);
    else md.push(line);
  });
  const open = dir as { name: string; line: number } | null;
  if (open) fail(`unclosed ":::${open.name}" directive opened at line ${open.line}`);
  flushMd();
  return sections;
}

const IMG = /^!\[([^\]]*)\]\(\s*(\S+?)(?:\s+"([^"]*)")?\s*\)$/;

function mdBlocks(text: string, links: Record<string, unknown>): PostBlock[] {
  const lexer = new md.Lexer();
  Object.assign(lexer.tokens.links, links);
  const tokens = lexer.lex(text);
  const blocks: PostBlock[] = [];
  let buf: Token[] = [];
  const flush = () => {
    if (buf.length === 0) return;
    const list = Object.assign([...buf], { links: tokens.links }) as unknown as TokensList;
    blocks.push({ kind: "prose", html: md.parser(list) });
    buf = [];
  };
  for (const tok of tokens) {
    const m = tok.type === "paragraph" ? IMG.exec(tok.raw.trim()) : null;
    if (m && m[3] === "full") {
      flush();
      blocks.push({ kind: "image", src: m[2], alt: m[1] });
    } else {
      buf.push(tok);
    }
  }
  flush();
  return blocks;
}

function sliderBlock(lines: string[], where: string, fail: (m: string) => never): PostBlock {
  const items: PostSliderItem[] = [];
  let cur: { title: string; text: string[][]; src?: string; alt?: string } | null = null;
  let newPara = true;
  const push = () => {
    if (cur) {
      const text = cur.text.map((p) => `<p>${md.parseInline(p.join(" ")) as string}</p>`).join("");
      items.push({ title: cur.title, text, src: cur.src, alt: cur.alt });
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      newPara = true;
      continue;
    }
    const h = /^###\s+(.+)$/.exec(line);
    if (h) {
      push();
      cur = { title: h[1].trim(), text: [] };
      newPara = true;
      continue;
    }
    if (!cur) fail(`:::slider ${where}: expected "### Title" before "${line}"`);
    const img = IMG.exec(line);
    if (img) {
      cur!.src = img[2];
      cur!.alt = img[1];
    } else if (newPara) {
      cur!.text.push([line]);
      newPara = false;
    } else {
      cur!.text[cur!.text.length - 1].push(line);
    }
  }
  push();
  if (items.length === 0) fail(`:::slider ${where}: no "### Title" items`);
  return { kind: "slider", items };
}

function outcomesBlock(lines: string[], where: string, fail: (m: string) => never): PostBlock {
  const stats: [string, string][] = [];
  const text: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const li = /^[-*]\s+(.+)$/.exec(line);
    if (li) {
      const sep = /\s[—–]\s/.exec(li[1]);
      if (!sep) fail(`:::outcomes ${where}: stat needs "VALUE — Label": "${line}"`);
      stats.push([li[1].slice(0, sep!.index).trim(), li[1].slice(sep!.index + sep![0].length).trim()]);
    } else {
      text.push(line);
    }
  }
  if (stats.length === 0) fail(`:::outcomes ${where}: no "- VALUE — Label" items`);
  return { kind: "outcomes", stats, html: md.parseInline(text.join(" ")) as string };
}

function directiveBlock(d: Extract<Chunk, { type: "dir" }>, fail: (m: string) => never): PostBlock {
  const where = `(line ${d.line})`;
  if (d.name === "slider") return sliderBlock(d.lines, where, fail);
  if (d.name === "outcomes") return outcomesBlock(d.lines, where, fail);
  const text = d.lines.map((l) => l.trim()).filter(Boolean).join(" ").replace(/\s+/g, " ");
  if (!text) fail(`:::logline ${where}: empty`);
  return { kind: "logline", html: md.parseInline(text) as string };
}

function splitSections(body: string, firstLine: number, fail: (m: string) => never): PostSection[] {
  const links = md.lexer(body).links;
  return tokenize(body, firstLine, fail)
    .map((s) => ({
      label: s.label,
      blocks: s.chunks.flatMap((c) => (c.type === "md" ? mdBlocks(c.text, links) : [directiveBlock(c, fail)])),
    }))
    .filter((s) => s.label || s.blocks.length > 0);
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
  const bodyLine = raw.slice(0, raw.length - body.length).split("\n").length;
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
    readMinutes: readMinutes(proseWords(body)),
    sections: splitSections(body, bodyLine, fail),
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
