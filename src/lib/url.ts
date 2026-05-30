import type { Lang } from "../i18n/translations";

export const BASE = import.meta.env.BASE_URL;
export const BASE_NO_SLASH = BASE.replace(/\/$/, "");

export function baseWithLang(lang: Lang): string {
  return `${BASE}${lang}/`.replace(/\/+$/, "/");
}

export function assetUrl(src: string): string {
  return `${BASE}${src.replace(/^\/+/, "")}`;
}

export function caseLink(id: string, lang: Lang = "en"): string {
  return `${BASE}${lang}/case/${id}`;
}
