export type Category = "design-engineering" | "ai-tools" | "product-building";

export const CATEGORY_LABEL: Record<Category, string> = {
  "design-engineering": "Design engineering",
  "ai-tools": "AI tools",
  "product-building": "Product building",
};

export interface PostSliderItem {
  title: string;
  /** inline-rendered HTML paragraphs */
  text: string;
  src?: string;
  alt?: string;
}

/** Body building blocks; each maps to a case-study block. */
export type PostBlock =
  | { kind: "prose"; html: string }
  | { kind: "logline"; html: string }
  | { kind: "slider"; items: PostSliderItem[] }
  | { kind: "image"; src: string; alt: string }
  | { kind: "outcomes"; stats: [value: string, label: string][]; html: string };

/** label is "" for text before the first `##` heading. */
export interface PostSection {
  label: string;
  blocks: PostBlock[];
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
  /** path under public/; raster (not WebP) for social previews */
  ogImage?: string;
  readMinutes: number;
  sections: PostSection[];
}
