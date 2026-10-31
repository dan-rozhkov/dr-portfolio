import { getCaseStudy } from "../data/portfolio";
import { t } from "../i18n/translations";
import { getPost } from "../writing/posts";
import type { Route } from "../hooks/useRoute";

export function getPageTitle(route: Route): string {
  const siteTitle = t(route.lang, "meta.title");

  if (route.name === "case") {
    const study = getCaseStudy(route.id);
    if (study) {
      return `${study.title} | ${siteTitle}`;
    }
  }

  if (route.name === "writing") {
    return `Writing | ${siteTitle}`;
  }

  if (route.name === "jobs") {
    return `Jobs | ${siteTitle}`;
  }

  if (route.name === "post") {
    const post = getPost(route.slug);
    return post ? `${post.title} | ${siteTitle}` : `Post not found | ${siteTitle}`;
  }

  return siteTitle;
}
