import { BASE } from "./url";

export function casesLink(category?: string): string {
  const base = `${BASE}en/cases/`;
  return category ? `${base}?category=${encodeURIComponent(category)}` : base;
}

export function postLink(slug: string): string {
  return `${BASE}en/cases/${slug}/`;
}
