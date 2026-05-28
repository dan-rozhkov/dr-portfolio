export type MetaEntry = [label: string, value: string];

export type RecognitionItem = [title: string, detail: string, href: string];

export interface RecognitionGroup {
  title: string;
  items: RecognitionItem[];
}

export interface Profile {
  name: string;
  location: string;
  year: string;
  email: string;
  linkedin: string;
  linkedinLabel: string;
}

export interface Hero {
  lines: string[];
}

export interface CaseSummary {
  id: string;
  title: string;
  description: string[];
  meta: MetaEntry[];
  visual: string;
  variant?: "mobile";
}

export interface ExtraWork {
  title: string;
  description: string;
  tabs: string[];
}

export type SectionStat = [value: string, label: string];

export type CaseSection =
  | { kind: "logline"; label?: string; text: string }
  | { kind: "case"; label?: string; text: string }
  | { kind: "image"; src?: string; alt?: string; aspect?: string }
  | {
      kind: "subhead";
      title: string;
      text: string;
      aspect?: string;
    }
  | {
      kind: "outcomes";
      label?: string;
      stats: SectionStat[];
      text: string;
    };

export interface CaseStudy {
  id: string;
  title: string;
  intro: string;
  meta: MetaEntry[];
  sections: CaseSection[];
  heroImage?: string;
  heroImageAlt?: string;
  heroBackground?: string;
}

export const profile: Profile = {
  name: "Danil Rozhkov",
  location: "Georgia",
  year: "2026",
  email: "rozhkov.dev@gmail.com",
  linkedin: "https://www.linkedin.com/in/danil-rozhkov/",
  linkedinLabel: "in/danil-rozhkov",
};

export const hero: Hero = {
  lines: [
    "Lead Product Designer for AI and B2B tools, from product logic to shipped UI",
  ],
};

export const cases: CaseSummary[] = [
  {
    id: "openprovider",
    title: "Openprovider Reseller Dashboard",
    description: [
      "A reseller dashboard used by 15K+ customers across English, Spanish, and Russian markets.",
      "I led the UX redesign and shipped a design system for 100+ desktop, tablet, and mobile screens in four months.",
    ],
    meta: [
      ["Years", "2022-2025"],
      ["Role", "Senior Product Designer"],
      ["Scope", "UX, Design System, B2B Dashboards, Multi-device"],
      ["Output", "Design system, 100+ screens, reseller flows"],
    ],
    visual: "finance",
    variant: "mobile",
  },
  {
    id: "clearscale-msp",
    title: "ClearScale MSP Portal",
    description: [
      "An enterprise managed-services portal for ClearScale clients with $10M+ in AWS infrastructure.",
      "I redesigned the portal and moved the frontend to React, TypeScript, Next.js, and Styled Components as the sole designer-developer.",
    ],
    meta: [
      ["Years", "2018-2021"],
      ["Role", "UI Designer & Frontend Engineer"],
      ["Scope", "UX/UI, Frontend Migration, Enterprise Dashboards"],
      ["Output", "React MSP portal, redesigned client workflows"],
    ],
    visual: "cloud",
  },
  {
    id: "seligoai",
    title: "SeligoAI",
    description: [
      "A US student management platform for recruitment, retention, schedules, performance, materials, and predictive analytics.",
      "I designed the platform, design system, core components, responsive layouts, and key sections, then helped move them into frontend implementation.",
    ],
    meta: [
      ["Year", "2024"],
      ["Role", "Designer-Developer · Solo"],
      ["Scope", "Product UX, UI System, Responsive Web"],
      ["Output", "Design system, dashboards, key platform sections"],
    ],
    visual: "education",
    variant: "mobile",
  },
];

export const extraWork: ExtraWork = {
  title: "Also Shipped",
  description:
    "AI workflows, internal tools, and B2B platforms across Sber and SnapSoft, including prototype generation, design-system tooling, and production AI products.",
  tabs: [
    "Live Studio",
    "SlideSurf",
    "TalkPilot",
    "Sber India Prototype Tool",
    "LucidBots (SnapSoft)",
    "NDA AI tools",
  ],
};

export const about: string[] = [
  "Senior product designer with 8+ years in B2B SaaS, design systems, and AI products. I design complex platforms and stay close to engineering until they ship.",
  "Lead Product Designer at Sber, with past work at Openprovider, SnapSoft, and ClearScale. I care about systems, precise interaction details, and the quiet decisions that make complex tools feel obvious.",
];

export const recognition: RecognitionGroup[] = [
  {
    title: "Recognition",
    items: [
      [
        "#3 Startup of the Month, ProductRadar ↗",
        "TalkPilot, selected from 500+ submissions",
        "#talkpilot",
      ],
      [
        "Regional Accelerator ↗",
        "TalkPilot, accepted cohort",
        "#talkpilot",
      ],
      [
        "live-studio on npm ↗",
        "Open-source, MIT-licensed",
        "https://www.npmjs.com/package/live-studio",
      ],
    ],
  },
  {
    title: "Selected Work",
    items: [
      [
        "Openprovider Reseller Dashboard ↗",
        "100+ screens, 15K+ resellers",
        "/case/openprovider",
      ],
      [
        "ClearScale MSP Portal ↗",
        "$10M+ AWS infrastructure, React migration",
        "/case/clearscale-msp",
      ],
      [
        "SeligoAI ↗",
        "ML platform for student recruitment and retention",
        "/case/seligoai",
      ],
    ],
  },
];

const caseSections: Record<string, CaseSection[]> = {
  "live-studio": [
    {
      label: "Challenge",
      kind: "logline",
      text: "AI agents generate interface code without seeing the page they changed. The feedback loop breaks where visual quality matters most.",
    },
    {
      kind: "case",
      text: "Live Studio started from that gap. I wanted an agent to work on the same running interface a designer or frontend engineer sees: select an element, inspect styles, edit copy or attributes, and send structured changes back to source code.",
    },
    { kind: "image", aspect: "3840 / 1579" },
    {
      label: "Solution",
      kind: "logline",
      text: "I built an open-source editor that injects into a live app and talks to AI agents through MCP.",
    },
    {
      kind: "subhead",
      title: "Running app as the canvas",
      text: "Developers add one import to React, Vue, Next.js, or Nuxt. The editor runs inside a Shadow DOM, so app styles and scripts cannot leak into the panel.",
    },
    {
      kind: "subhead",
      title: "MCP bridge for agent work",
      text: "A WebSocket bridge connects the editor panel to an MCP server. Style, text, attribute, delete, duplicate, and token edits stream as structured events for Claude Code, Cursor, or another MCP agent.",
    },
    {
      kind: "subhead",
      title: "Source-aware edits",
      text: "The Vite `reactTracer` plugin adds file and line metadata to elements. When users edit the page, the agent opens the right component instead of searching the project by guesswork.",
    },
    {
      label: "Product Details",
      kind: "logline",
      text: "Live Studio turns the browser into a shared work surface for a human and an AI agent.",
    },
    {
      kind: "case",
      text: "I added two-way chat in the panel so users can message the agent with element attachments and receive answers beside the canvas. Channel events handle Claude Code notifications where available, and long polling keeps the flow usable with other MCP agents.",
    },
    {
      kind: "case",
      text: "The variables popover pulls values from project CSS variables and keeps edits inside the design system. Every change includes the viewport, so the agent can place a fix in base styles or a media query.",
    },
    { kind: "image", aspect: "2460 / 778" },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["npm", "Published package"],
        ["MIT", "Open-source license"],
        ["MCP", "Agent protocol"],
      ],
      text: "I published Live Studio on npm as `live-studio` under the MIT license. I built the product vision, editor UX, protocol architecture, Preact client, Node server, packaging, installer, and documentation.",
    },
  ],
  openprovider: [
    {
      label: "Challenge",
      kind: "logline",
      text: "Openprovider's reseller dashboard supports domain registration, billing, and reseller operations for 15K+ customers. Years of business logic, three language markets, and power-user habits shaped the redesign.",
    },
    {
      kind: "case",
      text: "The redesign needed to protect reseller speed while giving product and engineering a system they could use for every new page.",
    },
    {
      kind: "image",
      src: "/images/openprovider/components.png",
      alt: "Openprovider design system components",
      aspect: "3840 / 1579",
    },
    {
      label: "Solution",
      kind: "logline",
      text: "I led the UX redesign and built the design system from the ground up.",
    },
    {
      kind: "subhead",
      title: "Multilingual dashboard patterns",
      text: "I designed English, Spanish, and Russian interfaces around long labels, dense tables, validation states, and reseller terminology from the start.",
    },
    {
      kind: "subhead",
      title: "One system across devices",
      text: "The component set covered desktop, tablet, and mobile flows for domain search, renewals, billing, account management, and admin-heavy pages.",
    },
    {
      kind: "subhead",
      title: "Shared contract with engineering",
      text: "I worked with 5+ engineers and product managers across the Netherlands and India. The component library, patterns, and decision docs cut repeated discussions and gave the team a stable delivery base.",
    },
    {
      label: "Execution",
      kind: "logline",
      text: "I designed the migration path with the final interface.",
    },
    {
      kind: "case",
      text: "Some flows could change fast. Others needed a slower path because resellers depended on muscle memory. I separated users and workflows by risk, then redesigned the highest-value surfaces first.",
    },
    {
      kind: "case",
      text: "I started with basic styles and controls, then expanded into reseller-specific patterns. New pages no longer needed custom UI decisions for every table, form, empty state, or responsive breakpoint.",
    },
    {
      kind: "image",
      src: "/images/openprovider/mobile.png",
      alt: "Openprovider mobile dashboard preview",
      aspect: "2460 / 778",
    },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["15K+", "Resellers served"],
        ["100+", "Screens covered"],
        ["4 mo", "Design system delivery"],
      ],
      text: "The design system shipped to production and became the base for new product pages across desktop, tablet, mobile, EN, ES, and RU.",
    },
  ],
  slidesurf: [
    {
      label: "Challenge",
      kind: "logline",
      text: "A prompt-to-deck product has to do more than call an LLM. Users need structure, hierarchy, slide intent, speaker notes, and a clear way to revise the output.",
    },
    {
      kind: "case",
      text: "SlideSurf started with one job: describe the topic and context, then get a deck ready to present or refine.",
    },
    { kind: "image", aspect: "3840 / 1579" },
    {
      label: "Solution",
      kind: "logline",
      text: "I split generation into planning and content writing, then assembled the deck live in the UI.",
    },
    {
      kind: "subhead",
      title: "Planner before content",
      text: "The first LLM step creates the deck structure. A separate generator expands each slide. This gave SlideSurf tighter token control and a more predictable shape than one large model call.",
    },
    {
      kind: "subhead",
      title: "Streaming generation UX",
      text: "Users watch the deck come together slide by slide. The app shows progress while it writes titles, bullet points, and speaker notes, replacing the silent wait common in AI tools.",
    },
    {
      kind: "subhead",
      title: "Multi-provider routing",
      text: "I built one abstraction over OpenAI and Anthropic. The app can change models by task and budget without leaking provider details into the UI.",
    },
    {
      label: "Iteration",
      kind: "logline",
      text: "SlideSurf treats AI output as editable material.",
    },
    {
      kind: "case",
      text: "Users can regenerate one slide or refine specific points instead of starting over. That kept the workflow close to how people edit presentations.",
    },
    { kind: "image", aspect: "2460 / 778" },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["Launched", "Product status"],
        ["OpenAI", "LLM provider"],
        ["Claude", "LLM provider"],
      ],
      text: "SlideSurf launched with real users. I covered the product concept, UX, frontend, backend, prompt design, LLM integration, and release.",
    },
  ],
  "clearscale-msp": [
    {
      label: "Challenge",
      kind: "logline",
      text: "ClearScale needed an enterprise MSP portal for clients managing $10M+ in AWS infrastructure. The UI needed to support daily operations without turning cloud complexity into a maze.",
    },
    {
      kind: "case",
      text: "The portal needed a full redesign and a frontend migration. I owned product decisions, UX, UI, and React implementation as the sole designer-developer.",
    },
    {
      kind: "image",
      src: "/images/clearscale/billing-history.png",
      alt: "ClearScale billing history section",
      aspect: "3840 / 1579",
    },
    {
      label: "Solution",
      kind: "logline",
      text: "I redesigned the client workflows and moved the frontend to a modern React stack.",
    },
    {
      kind: "subhead",
      title: "Enterprise dashboard redesign",
      text: "I reorganized the portal around service monitoring, infrastructure state, and account activity. Expert users needed dense views; business stakeholders needed the same screens to read at a glance.",
    },
    {
      kind: "subhead",
      title: "React migration",
      text: "I led the move to React, TypeScript, Next.js, and Styled Components. Reusable components replaced brittle frontend patterns and gave the team room to add new portal sections.",
    },
    {
      kind: "subhead",
      title: "Design and code in one loop",
      text: "Because I owned design and implementation, prototypes could become production UI without a long handoff. Build edge cases shaped the design system while decisions were still cheap.",
    },
    {
      label: "Context",
      kind: "logline",
      text: "The portal served ClearScale's AWS consulting and managed-services work, where reliability mattered more than decoration.",
    },
    {
      kind: "case",
      text: "I also worked on data-heavy AWS products during the same period, including data warehouse, data lake, and real-time ingestion workflows. That context shaped the MSP portal's operational screens.",
    },
    {
      kind: "image",
      src: "/images/clearscale/dashboard.png",
      alt: "ClearScale MSP dashboard",
      aspect: "2460 / 778",
    },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["$10M+", "AWS infrastructure managed"],
        ["2018-2021", "ClearScale period"],
        ["React", "Frontend migration"],
      ],
      text: "The redesigned MSP portal gave ClearScale enterprise clients a React-based interface for managed AWS operations. I delivered the work as UI Designer and Frontend Engineer.",
    },
  ],
  seligoai: [
    {
      label: "Challenge",
      kind: "logline",
      text: "SeligoAI needed to make student recruitment, retention, and performance data usable for the US education market. Nontechnical users needed ML-backed insights they could act on.",
    },
    {
      kind: "case",
      text: "The platform covered schedules, performance tracking, learning materials, role-based dashboards, predictive analytics, and success indices. Each role needed a distinct workflow inside one visual language.",
    },
    {
      kind: "image",
      src: "/images/seligoai/inner-01.png",
      alt: "SeligoAI student management platform",
      aspect: "3840 / 1579",
    },
    {
      label: "Solution",
      kind: "logline",
      text: "I designed a responsive platform with bright accents, reusable components, and clear dashboard patterns.",
    },
    {
      kind: "subhead",
      title: "Design system first",
      text: "I created the core components and UI rules before moving into full pages. That gave the team a base for future sections instead of a pile of one-off screens.",
    },
    {
      kind: "subhead",
      title: "Predictive analytics without jargon",
      text: "The product exposed ML output through success indices and dashboard signals. I focused the UI on actions and status, so users could see where to pay attention.",
    },
    {
      kind: "subhead",
      title: "Responsive education workflows",
      text: "I designed the platform for desktop, tablet, and mobile. Schedules, materials, and performance views kept their core data on smaller screens.",
    },
    {
      label: "Implementation",
      kind: "logline",
      text: "The stack supported fast product development and a component-driven interface.",
    },
    {
      kind: "case",
      text: "I worked with Next.js, TailwindCSS, and Webpack, combining product design and frontend implementation. The solo setup helped me move from component decisions to working sections in short cycles.",
    },
    {
      kind: "image",
      src: "/images/seligoai/inner-02.png",
      alt: "SeligoAI analytics and management interface",
      aspect: "2460 / 778",
    },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["2024", "Project year"],
        ["Next.js", "Frontend stack"],
        ["US", "Target market"],
      ],
      text: "SeligoAI left the team with a design system, core components, and key sections for student management, recruitment, retention, and predictive analytics.",
    },
  ],
  talkpilot: [
    {
      label: "Challenge",
      kind: "logline",
      text: "Power users were moving between GPT, Claude, Gemini, and regional models. TalkPilot brought that work into one product while keeping model tradeoffs visible.",
    },
    {
      kind: "case",
      text: "TalkPilot combined multi-model chat, image generation, and web search. Adding providers was the easy part. Pricing, latency, streaming, failures, and model behavior all differ, so the UX needed a consistent surface over uneven infrastructure.",
    },
    {
      kind: "image",
      src: "/images/talkpilot/inner-01.png",
      alt: "TalkPilot multi-model chat interface",
      aspect: "3840 / 1579",
    },
    {
      label: "Solution",
      kind: "logline",
      text: "I built a multi-model AI workspace with 20+ LLMs and visible model choice.",
    },
    {
      kind: "subhead",
      title: "One interface for 20+ models",
      text: "TalkPilot brings GPT, Claude, Gemini, Yandex, and other models into one interface. Users keep their work in one place while choosing the model that fits the task.",
    },
    {
      kind: "subhead",
      title: "Visible model tradeoffs",
      text: "I kept model selection visible instead of hiding it behind a vague automatic mode. The UI explains speed, quality, and cost in plain language.",
    },
    {
      kind: "subhead",
      title: "Full-stack solo build",
      text: "I owned UX, frontend, backend, and LLM integration. The production stack used React, TypeScript, and Node.js, with provider-specific behavior normalized behind the UI.",
    },
    {
      label: "Growth",
      kind: "logline",
      text: "TalkPilot found traction as a solo-built AI tool.",
    },
    {
      kind: "case",
      text: "TalkPilot reached 550+ monthly sign-ups and 12% free-to-paid conversion. ProductRadar selected it as #3 Startup of the Month from 500+ submissions, and a regional accelerator accepted it into a cohort.",
    },
    {
      kind: "image",
      src: "/images/talkpilot/inner-02.png",
      alt: "TalkPilot neural network aggregator interface",
      aspect: "2460 / 778",
    },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["20+", "LLMs in one interface"],
        ["550+", "Monthly sign-ups"],
        ["12%", "Free-to-paid conversion"],
      ],
      text: "TalkPilot shipped with multi-model chat, image generation, and web search. It gave me a measured solo case across product, design, engineering, and LLM integration.",
    },
  ],
};

interface HeroImage {
  src: string;
  alt: string;
  background?: string;
}

const caseHeroImages: Record<string, HeroImage> = {
  openprovider: {
    src: "/images/openprovider/hero.png",
    alt: "Openprovider dashboard preview",
  },
  "clearscale-msp": {
    src: "/images/clearscale/billing-details.png",
    alt: "ClearScale billing details section",
  },
  seligoai: {
    src: "/images/seligoai/hero.png",
    alt: "SeligoAI student management platform",
  },
  talkpilot: {
    src: "/images/talkpilot/hero.png",
    alt: "TalkPilot product preview",
    background: "rgb(31 31 31)",
  },
};

export const caseStudies: Record<string, CaseStudy> = Object.fromEntries(
  cases.map((c): [string, CaseStudy] => [
    c.id,
    {
      id: c.id,
      title: c.title,
      intro: c.description[0],
      meta: c.meta,
      sections: caseSections[c.id],
      heroImage: caseHeroImages[c.id]?.src,
      heroImageAlt: caseHeroImages[c.id]?.alt,
      heroBackground: caseHeroImages[c.id]?.background,
    },
  ])
);

export const getCaseStudy = (id: string): CaseStudy | null =>
  caseStudies[id] ?? null;

export const getCase = (id: string): CaseSummary | undefined =>
  cases.find((c) => c.id === id);
