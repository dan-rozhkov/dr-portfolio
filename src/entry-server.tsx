import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { t } from "./i18n/translations";
import { parseRoute } from "./hooks/useRoute";
import { getPageTitle } from "./lib/pageTitle";
import { getPost, getPosts } from "./writing/posts";
import { buildRss } from "./writing/rss";

export { getCases as cases } from "./data/portfolio";

export function render(path: string): string {
  return renderToString(
    <StrictMode>
      <App initialPath={path} />
    </StrictMode>
  );
}

export function pageTitle(path: string): string {
  return getPageTitle(parseRoute(path));
}

export function postSlugs(): string[] {
  return getPosts().map((p) => p.slug);
}

const CASES_DESCRIPTION =
  "Products I designed and built, and the decisions behind them: design engineering, AI tools and product building.";
const JOBS_DESCRIPTION =
  "Design engineer and product builder roles worldwide, tracked by my own agent and checked three times a week.";

/** `image` is a site-relative path; prerender prefixes the origin. */
export function pageMeta(path: string): {
  title: string;
  description: string;
  ogDescription: string;
  image: string;
  type: "website" | "article";
} {
  const route = parseRoute(path);
  const title = pageTitle(path);
  let description = t(route.lang, "meta.description");
  let ogDescription = t(route.lang, "meta.ogDescription");
  const legacy = route.name === "home" || route.name === "case";
  let image = "/portrait.png";
  let type: "website" | "article" = "website";
  if (route.name === "cases") description = CASES_DESCRIPTION;
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
  if (!legacy) ogDescription = description;
  return { title, description, ogDescription, image, type };
}

export function rss(origin: string): string {
  return buildRss(getPosts(), origin);
}
