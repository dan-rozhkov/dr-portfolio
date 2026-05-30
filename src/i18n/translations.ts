export type Lang = "en" | "ru";

export interface Translations {
  // Header
  "nav.work": string;
  "nav.about": string;
  "nav.contact": string;
  "nav.contactMobile": string;
  "nav.cv": string;
  // Contact section
  "contact.heading": string;
  "contact.email": string;
  "contact.linkedin": string;
  // Skills physics section
  "skills.heading": string;
  // Case study section labels
  "case.viewCase": string;
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
  "nav.contact": "Contact",
  "nav.contactMobile": "@",
  "nav.cv": "CV ↗",
  "contact.heading": "Let's build something useful together",
  "contact.email": "Get in touch ↗",
  "contact.linkedin": "LinkedIn ↗",
  "skills.heading": "",
  "case.viewCase": "VIEW",
  "extra.next": "NEXT",
  "extra.prev": "PREV",
  "extra.nextProject": "Next project preview",
  "extra.prevProject": "Previous project preview",
  "case.outcomes": "Outcomes",
  "meta.title": "Danil Rozhkov",
  "meta.description": "Personal portfolio for product, interface, and AI-assisted design work.",
  "meta.ogTitle": "Danil Rozhkov — Lead Product Designer",
  "meta.ogDescription": "Lead Product Designer for AI and B2B tools, from product logic to shipped UI.",
  "nav.ariaLabel": "Primary navigation",
  "case.ariaNav": "Case study navigation",
};

const ru: Translations = {
  "nav.work": "Работы",
  "nav.about": "О себе",
  "nav.contact": "Контакты",
  "nav.contactMobile": "@",
  "nav.cv": "Резюме ↗",
  "contact.heading": "Давайте сделаем что-то полезное вместе",
  "contact.email": "Написать ↗",
  "contact.linkedin": "LinkedIn ↗",
  "skills.heading": "",
  "case.viewCase": "СМОТРЕТЬ",
  "extra.next": "ДАЛЕЕ",
  "extra.prev": "НАЗАД",
  "extra.nextProject": "Следующий проект",
  "extra.prevProject": "Предыдущий проект",
  "case.outcomes": "Результаты",
  "meta.title": "Даниил Рожков",
  "meta.description": "Персональное портфолио продуктового и интерфейсного дизайна.",
  "meta.ogTitle": "Даниил Рожков — Lead Product Designer",
  "meta.ogDescription": "Lead Product Designer для AI и B2B-инструментов, от продуктовой логики до реализованного интерфейса.",
  "nav.ariaLabel": "Основная навигация",
  "case.ariaNav": "Навигация по кейсам",
};

const translations: Record<Lang, Translations> = { en, ru };

export function t(lang: Lang, key: keyof Translations): string {
  return translations[lang][key] ?? key;
}
