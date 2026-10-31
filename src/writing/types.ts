export type Category = "design-engineering" | "ai-tools" | "product-building";

export const CATEGORY_LABEL: Record<Category, string> = {
  "design-engineering": "Design engineering",
  "ai-tools": "AI tools",
  "product-building": "Product building",
};

/** label is "" for text before the first `##` heading. */
export interface PostSection {
  label: string;
  html: string;
}

export interface Post {
  slug: string;
  title: string;
  dek: string;
  /** YYYY-MM-DD */
  date: string;
  category: Category;
  tldr: string[];
  stack: string[];
  links: { label: string; url: string }[];
  /** path under public/ */
  cover?: string;
  readMinutes: number;
  sections: PostSection[];
}
