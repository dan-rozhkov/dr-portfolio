export type Lang = "en";

export interface Translations {
  // Header
  "nav.work": string;
  "nav.about": string;
  "nav.writing": string;
  "nav.contact": string;
  "nav.contactMobile": string;
  "nav.cv": string;
  // Contact section
  "contact.heading": string;
  "contact.email": string;
  "contact.linkedin": string;
  // Skills physics section
  "skills.heading": string;
  // Extra work
  "extra.next": string;
  "extra.prev": string;
  "extra.nextProject": string;
  "extra.prevProject": string;
  // Case study detail
  "case.outcomes": string;
  // SEO / meta
  "meta.title": string;
  "meta.description": string;
  "meta.ogTitle": string;
  "meta.ogDescription": string;
  // Navigation aria
  "nav.ariaLabel": string;
  "case.ariaNav": string;
}

const en: Translations = {
  "nav.work": "Work",
  "nav.about": "About",
  "nav.writing": "Cases",
  "nav.contact": "Contact",
  "nav.contactMobile": "@",
  "nav.cv": "CV ↗",
  "contact.heading": "Let's build something useful together",
  "contact.email": "Get in touch ↗",
  "contact.linkedin": "LinkedIn ↗",
  "skills.heading": "",
  "extra.next": "NEXT",
  "extra.prev": "PREV",
  "extra.nextProject": "Next project preview",
  "extra.prevProject": "Previous project preview",
  "case.outcomes": "Outcomes",
  "meta.title": "Danil Rozhkov",
  "meta.description": "Personal portfolio for product, interface, and AI-assisted design work.",
  "meta.ogTitle": "Danil Rozhkov — Lead Product Designer",
  "meta.ogDescription":
    "Lead Product Designer for AI and B2B tools, from product logic to shipped UI.",
  "nav.ariaLabel": "Primary navigation",
  "case.ariaNav": "Case study navigation",
};

const translations: Record<Lang, Translations> = { en };

export function t(lang: Lang, key: keyof Translations): string {
  return translations[lang][key] ?? key;
}
