import { CATEGORY_LABEL } from "./types";
import type { Category, Post } from "./types";

export function isCategory(value: string | null): value is Category {
  return value !== null && Object.hasOwn(CATEGORY_LABEL, value);
}

/** Unknown or missing category returns every post. */
export function filterPosts(posts: Post[], category: string | null): Post[] {
  return isCategory(category) ? posts.filter((p) => p.category === category) : posts;
}
