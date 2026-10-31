import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { setDataLang } from "./data/portfolio";
import { extractLang, parseRoute } from "./hooks/useRoute";
import { getPageTitle } from "./lib/pageTitle";
import { getPost, getPosts } from "./writing/posts";
import { buildRss } from "./writing/rss";

export { getCases as cases } from "./data/portfolio";

export function render(path: string): string {
  setDataLang(extractLang(path));
  return renderToString(
    <StrictMode>
      <App initialPath={path} />
    </StrictMode>
  );
}

export function pageTitle(path: string): string {
  setDataLang(extractLang(path));
  return getPageTitle(parseRoute(path));
}

export function posts(): {
  slug: string;
  title: string;
  dek: string;
  date: string;
  cover?: string;
}[] {
  return getPosts().map(({ slug, title, dek, date, cover }) => ({
    slug,
    title,
    dek,
    date,
    cover,
  }));
}

const HOME_DESCRIPTION =
  "Personal portfolio for product, interface, and AI-assisted design work.";
const WRITING_DESCRIPTION =
  "What I build and why. Long reads on design engineering, AI tooling and product decisions.";
const JOBS_DESCRIPTION =
  "Design engineer and product builder roles worldwide, tracked by my own agent and checked three times a week.";

/** `image` is a site-relative path; prerender prefixes the origin. */
export function pageMeta(path: string): {
  title: string;
  description: string;
  image: string;
  type: "website" | "article";
} {
  const route = parseRoute(path);
  const title = pageTitle(path);
  let description = HOME_DESCRIPTION;
  let image = "/portrait.png";
  let type: "website" | "article" = "website";
  if (route.name === "writing") description = WRITING_DESCRIPTION;
  else if (route.name === "jobs") description = JOBS_DESCRIPTION;
  else if (route.name === "post") {
    const post = getPost(route.slug);
    if (post) {
      description = post.dek;
      type = "article";
      const src = post.ogImage ?? post.cover;
      if (src) image = `/${src.replace(/^\/+/, "")}`;
    }
  }
  return { title, description, image, type };
}

export function rss(origin: string): string {
  return buildRss(getPosts(), origin);
}
