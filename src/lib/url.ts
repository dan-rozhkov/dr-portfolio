export const BASE = import.meta.env.BASE_URL;
export const BASE_NO_SLASH = BASE.replace(/\/$/, "");

export function assetUrl(src: string): string {
  return `${BASE}${src.replace(/^\/+/, "")}`;
}

export function caseLink(id: string): string {
  return `${BASE}case/${id}`;
}
