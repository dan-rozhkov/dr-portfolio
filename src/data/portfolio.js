export const profile = {
  name: "Danil Rozhkov",
  location: "Georgia",
  year: "2026",
  email: "rozhkov.dev@gmail.com",
  linkedin: "https://www.linkedin.com/in/danil-rozhkov/",
  linkedinLabel: "in/danil-rozhkov",
};

export const hero = {
  lines: [
    "Lead Product Designer for AI and B2B products — from UX to shipped interface",
  ],
};

export const cases = [
  {
    id: "live-studio",
    title: "Live Studio",
    description: [
      "An open-source visual UI editor wired to AI agents through the Model Context Protocol — giving the agent eyes and hands on the running page.",
      "I shaped the product category, designed the editor UX and panel interactions, and took it end-to-end — interface, protocol, and implementation — as a solo designer-developer.",
    ],
    meta: [
      ["Year", "2025-2026"],
      ["Role", "Product Designer · Solo"],
      ["Scope", "Product, UX/UI, Interaction Design, Implementation"],
      ["Output", "Open-source tool on npm, agent UX patterns, docs"],
    ],
    visual: "ai",
  },
  {
    id: "openprovider",
    title: "Openprovider Reseller Dashboard",
    description: [
      "A business-critical B2B dashboard for 15K+ resellers across English, Spanish, and Russian markets — domain registration, billing, and reseller operations.",
      "I led the full UX redesign and shipped a design system covering 100+ screens on desktop, tablet, and mobile in four months. All new product pages now build on it.",
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
    id: "slidesurf",
    title: "SlideSurf",
    description: [
      "A launched AI product that turns a short prompt into a full slide deck — structure, titles, bullets, speaker notes — assembled live in the UI.",
      "I designed the product end-to-end as a solo designer-developer — generation flow, streaming UX, slide-level editing, and the interaction patterns that make AI output feel iterable instead of one-shot.",
    ],
    meta: [
      ["Year", "2024-2025"],
      ["Role", "Product Designer · Solo"],
      ["Scope", "Product, UX, Interaction Design, AI UX patterns"],
      ["Output", "Launched product, streaming generation UX"],
    ],
    visual: "index",
  },
];

export const extraWork = {
  title: "Also Shipped",
  description:
    "AI-first workflows, internal tools, and B2B platforms across Sber, SnapSoft, and ClearScale — from MSP portals on $10M+ AWS infrastructure to ML platforms for student success.",
  tabs: [
    "Sber India Prototype Tool",
    "LucidBots (SnapSoft)",
    "SeligoAI (ClearScale)",
    "TalkPilot",
  ],
};

export const about = [
  "Senior product designer, 8+ years across B2B SaaS, design systems, and AI products. I design complex platforms and stay close enough to engineering to ship them.",
  "Lead Product Designer at Sber. Previously Openprovider, SnapSoft, ClearScale. I care about systems, sharp interaction details, and the quiet parts that make complex tools feel obvious.",
];

export const recognition = [
  {
    title: "Recognition",
    items: [
      [
        "#3 Startup of the Month — ProductRadar ↗",
        "TalkPilot, selected from 500+ submissions",
        "https://productradar.ru/",
      ],
      [
        "Regional Accelerator ↗",
        "TalkPilot — accepted cohort",
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
        "TalkPilot ↗",
        "20+ LLMs, 550+ monthly sign-ups, 12% free→paid",
        "#talkpilot",
      ],
      [
        "Openprovider Design System ↗",
        "100+ screens, 15K+ resellers",
        "#openprovider",
      ],
      [
        "SeligoAI ↗",
        "ML platform for student recruitment & retention",
        "#seligoai",
      ],
    ],
  },
];

const placeholderSections = (title) => [
  {
    label: "Challenge",
    kind: "logline",
    text: `${title} started from a sharp constraint — a category that was either crowded with lookalikes or, in places, didn't exist as a product at all. The brief was to make something people would actually keep on their screen.`,
  },
  {
    label: "Solution",
    kind: "case",
    text: "I shaped the product end-to-end — discovery, interaction model, visual system, and the small details that make complex tools feel obvious. Each decision was tested in prototypes before any pixel was committed to the production system.",
  },
  { kind: "image", aspect: "3840 / 1579" },
  {
    kind: "case",
    text: "Most of the early concepts didn't make the cut. That was the point — iterate as fast as possible, explore the widest spectrum of directions, and let the strongest one win on its own merits.",
  },
  {
    kind: "case",
    text: "Once the core flow proved itself, the rest of the work was about giving it room to grow: a layout system, a set of patterns, and the discipline to keep saying no to the things that didn't earn their place.",
  },
  {
    label: "Competitive environment",
    kind: "logline",
    text: "The category had matured into a checklist of features that everyone copied from everyone. Doing the obvious thing meant being invisible — and being invisible was the one outcome we couldn't afford.",
  },
  { kind: "image", aspect: "2460 / 778" },
  {
    label: "Opportunity to stand out",
    kind: "case",
    text: "We chose to rebuild the moment that mattered most rather than polishing the edges. That meant rethinking the primary input, collapsing screens that had no reason to exist, and treating the result page as a first-class surface.",
  },
  {
    kind: "subhead",
    title: "A focused, decluttered flow",
    text: "I cut the steps in half, removed every modal that didn't earn its place, and built a single input that adapts to what you're trying to do. The fields stay editable at any moment — no more frustration when you change your mind mid-task.",
  },
  {
    kind: "subhead",
    title: "One input does the work of many",
    text: "Pick from a list or type a name — autocomplete handles the rest. The field stays active so you can correct in place, and we surface the most likely destination so you don't have to guess.",
  },
  {
    kind: "subhead",
    title: "One pattern, many surfaces",
    text: "Once the core flow proved itself, I turned it into a customisable module. The same component now powers several different products in the suite, which means consistency comes for free and improvements land everywhere at once.",
  },
  {
    label: "Overcoming obstacles",
    kind: "logline",
    text: "No effort for users, but plenty of it for us",
  },
  {
    kind: "case",
    text: "Using existing patterns is always easier — it took weeks of prototypes and stakeholder conversations to ship something that didn't look like everything else. Several features were initially flagged as incompatible with internal guidelines.",
  },
  {
    kind: "case",
    text: "Giving up and shipping the safe version would have been the easy call. Instead I insisted on the negotiation, walked the design through each objection, and got the original solution approved end-to-end.",
  },
  { kind: "image", aspect: "3648 / 1038" },
  {
    label: "Behind the scenes",
    kind: "logline",
    text: "None of this could happen without a proper environment. Every week our team ran UX tests, pair design sessions, and built the process around the work — not the other way around.",
  },
  {
    kind: "subhead",
    title: "Collaboration and transparency",
    text: "I recorded ideas and iterations on a regular cadence so the team stayed in sync, tracked progress, and shared feedback in a less formal but more thoughtful way than scheduled reviews allowed.",
  },
  {
    kind: "subhead",
    title: "Components that speed up the game",
    text: "We needed to test and scale all sorts of things, so the tools had to support it. The components were structured to spawn dozens of variants from a single source and iterate at a much higher pace.",
  },
  {
    kind: "subhead",
    title: "Teamwork makes the dream work",
    text: "I'm grateful to the team that made this happen. The right group of people is the one thing that no process or tool can substitute for — and we had it.",
  },
  {
    kind: "outcomes",
    stats: [
      ["£28M", "Portfolio impact"],
      ["762k", "Users reached"],
      ["80%", "Completion rate"],
    ],
    text: "Within a year we shipped six products, each for its own audience. We didn't settle for average — every flow, every micro-interaction, every gradient got the same level of attention. I'm fond of the work and all the explorations made along the way.",
  },
];

const findCase = (id) => cases.find((c) => c.id === id);

export const caseStudies = Object.fromEntries(
  cases.map((c) => [
    c.id,
    {
      id: c.id,
      title: c.title,
      intro: c.description[0],
      meta: c.meta,
      sections: placeholderSections(c.title),
    },
  ])
);

export const getCaseStudy = (id) => caseStudies[id] || null;
export const getCase = findCase;
