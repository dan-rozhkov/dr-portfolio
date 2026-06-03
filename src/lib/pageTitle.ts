import { getCaseStudy } from "../data/portfolio";
import { t } from "../i18n/translations";
import type { Route } from "../hooks/useRoute";

export function getPageTitle(route: Route): string {
  const siteTitle = t(route.lang, "meta.title");

  if (route.name === "case") {
    const study = getCaseStudy(route.id);
    if (study) {
      return `${study.title} | ${siteTitle}`;
    }
  }

  return siteTitle;
}
