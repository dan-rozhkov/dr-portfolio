import { CATEGORY_LABEL } from "./types";
import type { Category } from "./types";

export function isCategory(value: string | null): value is Category {
  return value !== null && Object.hasOwn(CATEGORY_LABEL, value);
}

/** Unknown or missing category returns every item. */
export function filterByCategory<T extends { category: Category }>(items: T[], category: string | null): T[] {
  return isCategory(category) ? items.filter((p) => p.category === category) : items;
}
