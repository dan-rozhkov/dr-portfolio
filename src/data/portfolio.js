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
    "Lead Product Designer for AI and B2B products, from UX to shipped interface",
  ],
};

export const cases = [
  {
    id: "live-studio",
    title: "Live Studio",
    description: [
      "An open-source visual UI editor that connects AI agents to a running app through the Model Context Protocol.",
      "I built the product end to end as a solo AI Product Engineer: editor UX, MCP protocol, Preact client, Node server, npm package, and docs.",
    ],
    meta: [
      ["Year", "2025-2026"],
      ["Role", "AI Product Engineer · Solo"],
      ["Scope", "Product, UX/UI, Interaction Design, Implementation"],
      ["Output", "Open-source npm package, MIT license, agent UX patterns"],
    ],
    visual: "ai",
  },
  {
    id: "openprovider",
    title: "Openprovider Reseller Dashboard",
    description: [
      "A business-critical B2B dashboard for 15K+ resellers across English, Spanish, and Russian markets.",
      "I led the UX redesign and shipped a design system covering 100+ screens on desktop, tablet, and mobile in four months.",
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
      "A launched AI product that turns a short prompt into a full slide deck with structure, titles, bullet points, and speaker notes.",
      "I designed and built the product as a solo AI Product Engineer, including the generation flow, streaming UX, prompt architecture, and LLM integration.",
    ],
    meta: [
      ["Year", "2024-2025"],
      ["Role", "AI Product Engineer · Solo"],
      ["Scope", "Product, UX, Interaction Design, AI UX patterns"],
      ["Output", "Launched product, streaming generation UX"],
    ],
    visual: "index",
  },
  {
    id: "clearscale-msp",
    title: "ClearScale MSP Portal",
    description: [
      "An enterprise managed-services portal for ClearScale clients managing $10M+ in AWS infrastructure.",
      "I redesigned the portal and led the frontend migration to React, TypeScript, Next.js, and Styled Components as the sole designer-developer.",
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
      "A student management platform for the US market, built around recruitment, retention, schedules, performance, materials, and predictive analytics.",
      "I designed the platform, the design system, basic components, responsive layouts, and key sections, then helped move it into frontend implementation.",
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
  {
    id: "talkpilot",
    title: "TalkPilot",
    description: [
      "A neural network aggregator that brings 20+ LLMs into one interface, including GPT, Claude, Gemini, and Yandex models.",
      "I shipped the product as a solo designer-developer across UX, frontend, backend, and LLM integration.",
    ],
    meta: [
      ["Year", "2024"],
      ["Role", "Founder · Designer & Developer"],
      ["Scope", "Product, UX, Frontend, Backend, LLM Integration"],
      ["Output", "Multi-model chat, image generation, web search"],
    ],
    visual: "ai",
  },
];

export const extraWork = {
  title: "Also Shipped",
  description:
    "AI-first workflows, internal tools, and B2B platforms across Sber and SnapSoft. The work spans prototype generation, design-system tooling, and production AI products.",
  tabs: ["Sber India Prototype Tool", "LucidBots (SnapSoft)", "NDA AI tools"],
};

export const about = [
  "Senior product designer, 8+ years across B2B SaaS, design systems, and AI products. I design complex platforms and stay close enough to engineering to ship them.",
  "Lead Product Designer at Sber. Previously Openprovider, SnapSoft, and ClearScale. I care about systems, sharp interaction details, and the quiet parts that make complex tools feel obvious.",
];

export const recognition = [
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
        "TalkPilot ↗",
        "20+ LLMs, 550+ monthly sign-ups, 12% free-to-paid",
        "#talkpilot",
      ],
      [
        "Openprovider Design System ↗",
        "100+ screens, 15K+ resellers",
        "#openprovider",
      ],
      [
        "SeligoAI ↗",
        "ML platform for student recruitment and retention",
        "#seligoai",
      ],
    ],
  },
];

const caseSections = {
  "live-studio": [
    {
      label: "Challenge",
      kind: "logline",
      text: "AI agents can generate interface code, but they usually cannot see the page they just changed. The feedback loop breaks at the exact point where visual quality matters.",
    },
    {
      kind: "case",
      text: "Live Studio started from that gap. I wanted an agent to work on the same running interface a designer or frontend engineer sees, select an element, inspect its styles, edit copy or attributes, and send structured changes back to source code.",
    },
    { kind: "image", aspect: "3840 / 1579" },
    {
      label: "Solution",
      kind: "logline",
      text: "I built an open-source editor that injects into a live app and connects to AI agents through MCP.",
    },
    {
      kind: "subhead",
      title: "Running app as the canvas",
      text: "The tool plugs into React, Vue, Next.js, or Nuxt with a one-line import. The editor runs inside a Shadow DOM so product styles and scripts do not leak into the panel.",
    },
    {
      kind: "subhead",
      title: "MCP bridge for agent work",
      text: "A WebSocket bridge connects the editor panel to an MCP server. Style, text, attribute, delete, duplicate, and token edits stream as structured events that Claude Code, Cursor, or another MCP agent can apply to the source.",
    },
    {
      kind: "subhead",
      title: "Source-aware edits",
      text: "The Vite `reactTracer` plugin adds file and line metadata to elements. When a user edits the page, the agent knows which component to open instead of searching through the project by guesswork.",
    },
    {
      label: "Product Details",
      kind: "logline",
      text: "The product is not only an inspector. It is a working contract between a human, a browser surface, and an AI agent.",
    },
    {
      kind: "case",
      text: "I added two-way chat in the panel so users can message the agent with element attachments and receive answers in the same place. Channel events handle Claude Code notifications where available, and a 60-second long-polling fallback keeps the flow usable with other MCP agents.",
    },
    {
      kind: "case",
      text: "The variables popover pulls values from project CSS variables, so edits stay inside the design system. The viewport ships with every change, which lets the agent decide whether a fix belongs in base styles or inside a media query.",
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
      text: "Live Studio is published on npm as `live-studio` and released under the MIT license. I built the product vision, editor UX, protocol architecture, Preact client, Node server, packaging, installer, and documentation.",
    },
  ],
  openprovider: [
    {
      label: "Challenge",
      kind: "logline",
      text: "Openprovider's reseller dashboard supports domain registration, billing, and reseller operations for 15K+ customers. The product had years of business logic, three language markets, and many power-user habits baked into it.",
    },
    {
      kind: "case",
      text: "A clean redesign was not enough. The work had to preserve the speed expected by existing resellers while giving product and engineering a system they could use for every new page.",
    },
    { kind: "image", aspect: "3840 / 1579" },
    {
      label: "Solution",
      kind: "logline",
      text: "I led the full UX redesign and built the design system from the ground up.",
    },
    {
      kind: "subhead",
      title: "Multilingual dashboard patterns",
      text: "The system covered English, Spanish, and Russian interfaces. I treated long labels, dense tables, validation states, and reseller terminology as design constraints from the start.",
    },
    {
      kind: "subhead",
      title: "One system across devices",
      text: "The design system covered desktop, tablet, and mobile. Components had to work for domain search, renewals, billing, account management, and admin-heavy product pages.",
    },
    {
      kind: "subhead",
      title: "Shared contract with engineering",
      text: "I worked with 5+ engineers and product managers across the Netherlands and India. The component library, patterns, and decision docs reduced repeated discussions and gave the team a stable base for delivery.",
    },
    {
      label: "Execution",
      kind: "logline",
      text: "The key decision was to design migration, not only the final state.",
    },
    {
      kind: "case",
      text: "Some flows could change quickly. Others needed a slower path because resellers depended on muscle memory. I separated users and workflows by risk, then redesigned the high-value surfaces first.",
    },
    {
      kind: "case",
      text: "The system started with basic styles and controls, then expanded into reseller-specific patterns. New pages no longer needed custom UI decisions for every table, form, empty state, or responsive breakpoint.",
    },
    { kind: "image", aspect: "2460 / 778" },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["15K+", "Resellers served"],
        ["100+", "Screens covered"],
        ["4 mo", "Design system delivery"],
      ],
      text: "The design system shipped in production and became the base for all new product pages. It covered desktop, tablet, and mobile across EN, ES, and RU markets.",
    },
  ],
  slidesurf: [
    {
      label: "Challenge",
      kind: "logline",
      text: "A prompt-to-deck product has to do more than call an LLM. Users need a presentation with structure, hierarchy, slide intent, speaker notes, and a clear path to revise the output.",
    },
    {
      kind: "case",
      text: "SlideSurf started as a solo product build around a simple job: describe the topic and context, then get a deck that is ready to present or refine.",
    },
    { kind: "image", aspect: "3840 / 1579" },
    {
      label: "Solution",
      kind: "logline",
      text: "I split generation into planning and content writing, then made the deck assemble live in the UI.",
    },
    {
      kind: "subhead",
      title: "Planner before content",
      text: "The first LLM step creates the deck structure. A separate generator expands each slide. This gives the product better token control and a more predictable shape than asking one model for everything at once.",
    },
    {
      kind: "subhead",
      title: "Streaming generation UX",
      text: "Users watch the deck come together slide by slide. The interface shows progress while the system writes titles, bullet points, and speaker notes, which removes the silent wait common in AI tools.",
    },
    {
      kind: "subhead",
      title: "Multi-provider routing",
      text: "The product uses one abstraction over OpenAI and Anthropic. Model choice can change by task and budget without forcing the UI to care about provider-specific details.",
    },
    {
      label: "Iteration",
      kind: "logline",
      text: "The product treats AI output as editable material, not a finished artifact.",
    },
    {
      kind: "case",
      text: "Users can regenerate a single slide or refine specific points instead of starting from scratch. That decision kept the workflow close to how people actually edit presentations.",
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
      text: "SlideSurf launched with real users. I covered the product concept, UX, frontend, backend, prompt design, LLM integration, and production release.",
    },
  ],
  "clearscale-msp": [
    {
      label: "Challenge",
      kind: "logline",
      text: "ClearScale needed an enterprise MSP portal for clients managing $10M+ in AWS infrastructure. The interface had to support operational work without turning cloud complexity into a maze.",
    },
    {
      kind: "case",
      text: "The existing portal needed a complete redesign and a frontend migration. I owned both sides of the work as the sole designer-developer, which meant product decisions, UX, UI, and React implementation stayed tightly connected.",
    },
    { kind: "image", aspect: "3840 / 1579" },
    {
      label: "Solution",
      kind: "logline",
      text: "I redesigned the client workflows and moved the frontend to a modern React stack.",
    },
    {
      kind: "subhead",
      title: "Enterprise dashboard redesign",
      text: "I reorganized the portal around the information clients needed to monitor services, infrastructure state, and account activity. The UI had to be dense enough for expert users and clear enough for business stakeholders.",
    },
    {
      kind: "subhead",
      title: "React migration",
      text: "I led the migration to React, TypeScript, Next.js, and Styled Components. The move replaced brittle frontend patterns with reusable components and a codebase that could support new portal sections.",
    },
    {
      kind: "subhead",
      title: "Design and code in one loop",
      text: "Because I owned both design and implementation, prototypes could become production UI without a long handoff. Edge cases from the build shaped the design system instead of arriving too late.",
    },
    {
      label: "Context",
      kind: "logline",
      text: "The portal sat inside ClearScale's AWS consulting and managed-services work, where reliability mattered more than decoration.",
    },
    {
      kind: "case",
      text: "I also contributed to data-heavy AWS products during the same period, including UX for data warehouse, data lake, and real-time ingestion workflows. That context shaped how I approached complex operational screens in the MSP portal.",
    },
    { kind: "image", aspect: "2460 / 778" },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["$10M+", "AWS infrastructure managed"],
        ["2018-2021", "ClearScale period"],
        ["React", "Frontend migration"],
      ],
      text: "The redesigned MSP portal gave ClearScale enterprise clients a React-based interface for managed AWS operations. I delivered the work as UI Designer & Frontend Engineer.",
    },
  ],
  seligoai: [
    {
      label: "Challenge",
      kind: "logline",
      text: "SeligoAI needed to make student recruitment, retention, and performance data usable for a US education market audience. The product had ML-backed insights, but the interface had to stay clear for nontechnical users.",
    },
    {
      kind: "case",
      text: "The platform covered schedules, performance tracking, learning materials, role-based dashboards, predictive analytics, and success indices. Each section needed a common visual language without flattening the differences between user roles.",
    },
    { kind: "image", aspect: "3840 / 1579" },
    {
      label: "Solution",
      kind: "logline",
      text: "I designed a responsive platform with a bright accent style, reusable components, and clear dashboard patterns.",
    },
    {
      kind: "subhead",
      title: "Design system first",
      text: "I created the basic components and UI rules before pushing into full pages. That gave the product a base for future sections instead of a pile of one-off screens.",
    },
    {
      kind: "subhead",
      title: "Predictive analytics without jargon",
      text: "The product needed to expose ML output through success indices and dashboard signals. I focused the UI on actions and status, so users could understand where attention was needed.",
    },
    {
      kind: "subhead",
      title: "Responsive education workflows",
      text: "The platform was designed for desktop, tablet, and mobile. Schedules, materials, and performance views had to survive smaller screens without losing the data users came for.",
    },
    {
      label: "Implementation",
      kind: "logline",
      text: "The stack matched the need for fast product development and a component-driven interface.",
    },
    {
      kind: "case",
      text: "I worked with Next.js, TailwindCSS, and Webpack, combining product design and frontend implementation. The solo designer-developer setup helped move from component decisions to working sections quickly.",
    },
    { kind: "image", aspect: "2460 / 778" },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["2024", "Project year"],
        ["Next.js", "Frontend stack"],
        ["US", "Target market"],
      ],
      text: "SeligoAI left the team with a design system, core components, and key platform sections for student management, recruitment, retention, and predictive analytics.",
    },
  ],
  talkpilot: [
    {
      label: "Challenge",
      kind: "logline",
      text: "Power users were already moving between GPT, Claude, Gemini, and regional models. TalkPilot needed to bring that work into one product without hiding the model tradeoffs that matter.",
    },
    {
      kind: "case",
      text: "The product combined multi-model chat, image generation, and web search. The hard part was not only adding providers. Pricing, latency, streaming, failures, and model behavior all differ, so the UX needed a consistent surface over uneven infrastructure.",
    },
    { kind: "image", aspect: "3840 / 1579" },
    {
      label: "Solution",
      kind: "logline",
      text: "I built a neural network aggregator with 20+ LLMs and made model choice visible to users.",
    },
    {
      kind: "subhead",
      title: "One interface for 20+ models",
      text: "TalkPilot brings GPT, Claude, Gemini, Yandex, and other models into one interface. Users can keep their work in one place while choosing the model that fits the task.",
    },
    {
      kind: "subhead",
      title: "Visible model tradeoffs",
      text: "I chose not to bury model selection behind a vague automatic mode. The interface explains tradeoffs in plain language, including speed, quality, and cost.",
    },
    {
      kind: "subhead",
      title: "Full-stack solo build",
      text: "I owned UX, frontend, backend, and LLM integration. The production stack used React, TypeScript, and Node.js, with provider-specific behavior normalized behind the product UI.",
    },
    {
      label: "Growth",
      kind: "logline",
      text: "The product found traction as a solo-built AI tool, not a concept demo.",
    },
    {
      kind: "case",
      text: "TalkPilot reached 550+ monthly sign-ups and 12% free-to-paid conversion. It was selected as #3 Startup of the Month on ProductRadar from 500+ submissions and joined a regional accelerator.",
    },
    { kind: "image", aspect: "2460 / 778" },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["20+", "LLMs in one interface"],
        ["550+", "Monthly sign-ups"],
        ["12%", "Free-to-paid conversion"],
      ],
      text: "TalkPilot shipped as a full product with multi-model chat, image generation, and web search. It gave me a measured solo case across product, design, engineering, and LLM integration.",
    },
  ],
};

const findCase = (id) => cases.find((c) => c.id === id);

export const caseStudies = Object.fromEntries(
  cases.map((c) => [
    c.id,
    {
      id: c.id,
      title: c.title,
      intro: c.description[0],
      meta: c.meta,
      sections: caseSections[c.id],
    },
  ])
);

export const getCaseStudy = (id) => caseStudies[id] || null;
export const getCase = findCase;
