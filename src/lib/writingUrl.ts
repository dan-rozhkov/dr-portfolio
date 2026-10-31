import { BASE } from "./url";

export function writingLink(category?: string): string {
  const base = `${BASE}en/writing/`;
  return category ? `${base}?category=${encodeURIComponent(category)}` : base;
}

export function postLink(slug: string): string {
  return `${BASE}en/writing/${slug}/`;
}

export function jobsLink(): string {
  return `${BASE}en/jobs/`;
}
