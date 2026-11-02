export type Lang = "en" | "ru";

export interface Translations {
  // Header
  "nav.work": string;
  "nav.about": string;
  "nav.writing": string;
  "nav.jobs": string;
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
  // Analytics consent
  "consent.label": string;
  "consent.title": string;
  "consent.body": string;
  "consent.details": string;
  "consent.accept": string;
  "consent.reject": string;
  "consent.close": string;
  "consent.current.granted": string;
  "consent.current.denied": string;
  "consent.settings": string;
}

const en: Translations = {
  "nav.work": "Work",
  "nav.about": "About",
  "nav.writing": "Writing",
  "nav.jobs": "Jobs",
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
  "meta.ogDescription":
    "Lead Product Designer for AI and B2B tools, from product logic to shipped UI.",
  "nav.ariaLabel": "Primary navigation",
  "case.ariaNav": "Case study navigation",
  "consent.label": "Analytics consent",
  "consent.title": "Analytics",
  "consent.body":
    "Can I count visits with PostHog? It shows which pages and cases people open and which contact links they click. Nothing loads until you choose.",
  "consent.details":
    "Data goes to PostHog EU Cloud, hosted in the EU. No session recordings, no cookies, no form contents. If you accept, PostHog keeps an anonymous ID in your browser storage. Change your mind any time under “Analytics settings” at the bottom of the page.",
  "consent.accept": "Accept analytics",
  "consent.reject": "Reject analytics",
  "consent.close": "Close",
  "consent.current.granted": "Current choice: analytics accepted.",
  "consent.current.denied": "Current choice: analytics rejected.",
  "consent.settings": "Analytics settings",
};

const ru: Translations = {
  "nav.work": "Работы",
  "nav.about": "О себе",
  "nav.writing": "Writing",
  "nav.jobs": "Jobs",
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
  "meta.ogDescription":
    "Lead Product Designer для AI и B2B-инструментов, от продуктовой логики до реализованного интерфейса.",
  "nav.ariaLabel": "Основная навигация",
  "case.ariaNav": "Навигация по кейсам",
  "consent.label": "Согласие на аналитику",
  "consent.title": "Аналитика",
  "consent.body":
    "Можно я буду считать визиты через PostHog? Так я вижу, какие страницы и кейсы открывают и по каким контактам кликают. До вашего выбора ничего не загружается.",
  "consent.details":
    "Данные уходят в PostHog EU Cloud, серверы в ЕС. Без записи сессий, без cookies, без содержимого форм. Если вы согласитесь, PostHog сохранит анонимный ID в хранилище браузера. Передумать можно в любой момент: «Настройки аналитики» внизу страницы.",
  "consent.accept": "Принять аналитику",
  "consent.reject": "Отклонить аналитику",
  "consent.close": "Закрыть",
  "consent.current.granted": "Сейчас: аналитика разрешена.",
  "consent.current.denied": "Сейчас: аналитика отклонена.",
  "consent.settings": "Настройки аналитики",
};

const translations: Record<Lang, Translations> = { en, ru };

export function t(lang: Lang, key: keyof Translations): string {
  return translations[lang][key] ?? key;
}
