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
  preview?: { src: string; alt: string };
}

export interface ExtraWork {
  title: string;
  description: string;
  tabs: string[];
  previews: Record<string, { src: string; alt: string }>;
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
      src?: string;
      alt?: string;
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
    id: "sber-india-proto",
    title: "Sber India Prototype Tool",
    description: [
      "An internal AI tool for Sber's India arm that turns a brief or a Figma file into a working UI prototype, ready to test hypotheses and demo to stakeholders.",
      "I lead the tool end-to-end — pipeline, Claude Code and Figma MCP integration, product decisions, and rollout to designers and PMs.",
    ],
    meta: [
      ["Years", "2025-2026"],
      ["Role", "Lead Product Designer"],
      ["Scope", "AI Prototyping, Design Systems, Internal Tools"],
      ["Output", "AI prototyping pipeline, design-system integration"],
    ],
    visual: "ai",
    preview: { src: "images/sber-india-proto/hero.png", alt: "Sber India prototype tool component grid" },
  },
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
    preview: { src: "images/openprovider/mobile.png", alt: "Openprovider mobile screens" },
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
    preview: { src: "images/clearscale/billing-details.png", alt: "ClearScale MSP billing details" },
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
    preview: { src: "images/seligoai/hero.png", alt: "SeligoAI platform" },
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
    "LucidBots (SnapSoft)",
    "NDA AI tools",
  ],
  previews: {
    TalkPilot: { src: "images/talkpilot/hero.png", alt: "TalkPilot product hero" },
  },
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
  "sber-india-proto": [
    {
      label: "Challenge",
      kind: "logline",
      text: "Discovery at Sber India was bottlenecked by handmade prototypes. Every hypothesis needed a designer to assemble screens, an engineer to wire them up, and a week of calendar time before anyone could test the idea on a user.",
    },
    {
      kind: "case",
      text: "The team kept circling the same loop: a PM wrote a brief, a designer mocked it in Figma, a frontend engineer rebuilt it in code, and the prototype landed two sprints later — often answering a question the team had already moved past. Most ideas never made it to a usable surface because the cost of testing was higher than the cost of guessing.",
    },
    {
      kind: "case",
      text: "Designers also drifted from the product design system whenever they prototyped fast. One-off mockups skipped tokens, picked the wrong components, and produced prototypes that looked like the product but did not behave like it — which leaked into stakeholder reviews and reset alignment every time.",
    },
    {
      kind: "case",
      text: "I wanted the team to test ideas on the same rails the production app runs on, in hours instead of days, without adding another tool to learn.",
    },
    {
      kind: "image",
      src: "/images/sber-india-proto/guidelines.png",
      alt: "Sber India design-system guidelines page used as the tool's source of truth",
      aspect: "3840 / 5108",
    },
    {
      label: "Solution",
      kind: "logline",
      text: "I built an AI prototyping tool that reads the design system from Figma and writes working React prototypes through Claude Code.",
    },
    {
      kind: "case",
      text: "The tool takes a text brief, a user scenario, or a Figma file as input and produces an interactive prototype in code — onboarding, key product screens, and edge cases for UX testing — pulling components and tokens directly from the Sber India design system instead of inventing UI.",
    },
    {
      kind: "subhead",
      title: "Figma MCP as the source of truth",
      text: "Components and tokens are read directly from Figma, so the generator operates inside the existing system rather than around it. Prototypes land on the right rails the first time — no hallucinated buttons, no off-brand spacing, no quiet drift away from the production library.",
      src: "/images/sber-india-proto/slider-1.mp4",
      alt: "Figma MCP reading design system components",
    },
    {
      kind: "subhead",
      title: "Claude Code as the executor",
      text: "Generation and follow-up edits run through a Claude Code agent that knows the prototype repo's structure. Designers and PMs can iterate by typing changes or pushing visual edits, and the agent applies them to the source instead of rewriting screens from scratch.",
      src: "/images/sber-india-proto/slider-2.mp4",
      alt: "Claude Code generating prototype from brief",
    },
    {
      kind: "subhead",
      title: "Sandbox separate from production",
      text: "Prototypes live in an isolated repo, disconnected from production code but speaking the same component and token vocabulary. Teams can move fast on hypotheses without risking the shipped product, and a validated flow can graduate into production components when the bet pays off.",
    },
    {
      kind: "subhead",
      title: "Built for non-engineers",
      text: "The tool is wired for designers and PMs, not just developers. A brief in plain language produces a runnable prototype; visual edits push back to code; engineering only gets pulled in when the hypothesis is ready to ship.",
    },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["12×", "Faster brief-to-prototype than the Figma-to-handoff loop"],
        ["300+", "Prototypes shipped by designers and PMs in six months"],
        ["100%", "Design-system compliance across generated prototypes"],
      ],
      text: "The tool moved the India team from static Figma mockups to live, system-accurate prototypes inside the discovery loop. Hypotheses now get tested on working interfaces in hours instead of days, design-system drift disappeared from prototyping, and the same pipeline is becoming the template for AI-first workflows across other Sber teams.",
    },
  ],
  "live-studio": [
    {
      label: "Challenge",
      kind: "logline",
      text: "AI agents generate interface code without seeing the page they changed. The feedback loop breaks exactly where visual quality matters most — on the running screen.",
    },
    {
      kind: "case",
      text: "Designers and frontend engineers were stuck in a triangle: write a prompt, wait for a diff, refresh the browser, screenshot the result, paste it back to the agent. Every loop lost minutes and context. Teams either gave up on AI for visual work or shipped UI that was almost right but never quite tuned.",
    },
    {
      kind: "case",
      text: "Live Studio started from that gap. I wanted an agent to work on the same running interface a person sees: select an element, inspect styles, edit copy or attributes, push structured changes back to source code, and stay inside the design system the whole time.",
    },
    { kind: "image", aspect: "3840 / 1579" },
    {
      label: "Solution",
      kind: "logline",
      text: "I built an open-source editor that injects into a live app and talks to AI agents through MCP.",
    },
    {
      kind: "case",
      text: "The product had to feel like browser devtools, behave like a design tool, and speak the agent's language as a protocol. I designed all three layers as one product so teams could install it in minutes and trust it on production codebases.",
    },
    {
      kind: "subhead",
      title: "Running app as the canvas",
      text: "Developers add one import to React, Vue, Next.js, or Nuxt. The editor runs inside a Shadow DOM, so app styles and scripts cannot leak into the panel and the panel cannot break the app.",
    },
    {
      kind: "subhead",
      title: "MCP bridge for agent work",
      text: "A WebSocket bridge connects the editor panel to an MCP server. Style, text, attribute, delete, duplicate, and token edits stream as structured events for Claude Code, Cursor, or any MCP agent — no provider lock-in.",
    },
    {
      kind: "subhead",
      title: "Source-aware edits",
      text: "A Vite `reactTracer` plugin injects file and line metadata into elements. When a user edits the page, the agent opens the exact component instead of guessing — turning visual edits into clean, scoped PRs.",
    },
    {
      label: "Product Details",
      kind: "logline",
      text: "Live Studio turns the browser into a shared work surface for a human and an AI agent.",
    },
    {
      kind: "case",
      text: "Two-way chat sits inside the panel: users can attach the selected element to a message and the agent replies beside the canvas. Channel events handle Claude Code notifications natively, and a 60-second long-polling fallback keeps the flow usable with every other MCP agent.",
    },
    {
      kind: "case",
      text: "The variables popover reads values from the project's CSS variables, so every edit lands inside the design system instead of around it. Each change carries the viewport, so the agent can decide whether a fix belongs in base styles or a media query — responsive work stops being guesswork.",
    },
    {
      kind: "subhead",
      title: "One-line install",
      text: "An npm install plus a single import wires up the panel, the WebSocket bridge, and the MCP server. The installer auto-configures `.mcp.json` and drops skill files for supported agents.",
    },
    {
      kind: "subhead",
      title: "Skill-based agent contract",
      text: "Live Studio ships a skill describing the protocol, change types, and expected agent behaviors (`ask`, `panic`, `message`, `responding`). Agents follow the same playbook regardless of model.",
    },
    { kind: "image", aspect: "2460 / 778" },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["10×", "Faster design-to-code iteration"],
        ["2K+", "npm installs in first weeks"],
        ["0", "Manual handoff between visual edit and PR"],
      ],
      text: "Live Studio shipped as a published npm package under MIT license and pulled early adoption from teams running Claude Code and Cursor on production frontends. I owned the full stack solo — product vision, editor UX, MCP protocol architecture, Preact client, Node server, packaging, CLI installer, and documentation — and defined a new category along the way: tooling built for AI agents operating on the same interface as the human.",
    },
  ],
  openprovider: [
    {
      label: "Challenge",
      kind: "logline",
      text: "Openprovider's reseller dashboard supports domain registration, billing, and reseller operations for 15K+ customers. Years of business logic, three language markets, and power-user habits shaped what the redesign could and could not touch.",
    },
    {
      kind: "case",
      text: "Resellers run their own business on top of Openprovider. Every extra click multiplies across thousands of domains and millions of euros in billing each year. A wrong move on a checkout, a renewal flow, or a billing screen would not just frustrate users — it would cost the company real revenue and trust.",
    },
    {
      kind: "case",
      text: "The redesign had to protect reseller speed while giving product and engineering a system they could use for every new page, in EN, ES, and RU, across desktop, tablet, and mobile.",
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
      kind: "case",
      text: "Rather than ship a cosmetic refresh, I treated the design system as a delivery contract. Each pattern had to answer a real reseller question — how do I add a domain, how do I pay an invoice, how do I manage a customer — and survive translation, dense data, and small screens without breaking.",
    },
    {
      kind: "subhead",
      title: "Multilingual dashboard patterns",
      text: "I designed English, Spanish, and Russian interfaces around long labels, dense tables, validation states, and reseller terminology from day one. Localization stopped being a QA pass and became a constraint baked into the components.",
    },
    {
      kind: "subhead",
      title: "One system across devices",
      text: "The component set covered desktop, tablet, and mobile flows for domain search, renewals, billing, account management, and admin-heavy pages. Resellers could finish urgent operations from a phone without losing access to power-user tooling on desktop.",
    },
    {
      kind: "subhead",
      title: "Shared contract with engineering",
      text: "I worked with 5+ engineers and product managers across the Netherlands and India. The component library, patterns, and decision docs cut repeated discussions and gave the team a stable delivery base for every new feature.",
    },
    {
      label: "Execution",
      kind: "logline",
      text: "I designed the migration path with the final interface, not as a separate roadmap exercise.",
    },
    {
      kind: "case",
      text: "Some flows could change fast. Others needed a slower path because resellers depended on muscle memory built over years. I separated users and workflows by risk, then redesigned the highest-value surfaces first — checkout, renewals, billing — where small wins compound into real revenue.",
    },
    {
      kind: "case",
      text: "I started with basic styles and controls, then expanded into reseller-specific patterns. New pages stopped needing custom UI decisions for every table, form, empty state, or responsive breakpoint. Designers and engineers shipped faster with fewer review cycles.",
    },
    {
      kind: "subhead",
      title: "Risk-tiered rollout",
      text: "Quiet flows shipped first to surface system bugs. Mission-critical surfaces — billing, renewals, account admin — moved only when the system had proven itself on lower-stakes pages.",
    },
    {
      kind: "subhead",
      title: "Power-user defaults preserved",
      text: "Keyboard shortcuts, batch operations, and dense tables stayed available. The new UI looked modern without forcing experienced resellers to relearn their daily routines.",
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
        ["15K+", "Resellers on the new dashboard"],
        ["−35%", "Support tickets after redesign"],
        ["+22%", "Reseller checkout completion rate"],
      ],
      text: "The design system shipped to production and became the base for every new product page across desktop, tablet, mobile, EN, ES, and RU. Reseller workflows that used to require support hand-holding became self-serve, and the team kept delivering new features on the system long after the initial 4-month rollout.",
    },
  ],
  slidesurf: [
    {
      label: "Challenge",
      kind: "logline",
      text: "A prompt-to-deck product has to do more than call an LLM. Users need structure, hierarchy, slide intent, speaker notes, and a clear way to revise the output without restarting from scratch.",
    },
    {
      kind: "case",
      text: "Existing AI deck tools either dropped a wall of bullet points and called it a presentation, or made users wait silently for a giant model call that often missed the brief. Neither matched how people actually build slides — outline first, then draft, then revise the parts that need work.",
    },
    {
      kind: "case",
      text: "SlideSurf started with one job: describe the topic and context, then get a deck ready to present or refine. The product had to feel less like a chatbot and more like a co-writer that respects the structure of a presentation.",
    },
    { kind: "image", aspect: "3840 / 1579" },
    {
      label: "Solution",
      kind: "logline",
      text: "I split generation into planning and content writing, then assembled the deck live in the UI.",
    },
    {
      kind: "case",
      text: "Treating the LLM as a single black box was the easy path and also the wrong one. Splitting the job in two — outline first, then per-slide content — gave the product predictable shape, tighter token control, and a much better moment to let users intervene.",
    },
    {
      kind: "subhead",
      title: "Planner before content",
      text: "The first LLM step creates the deck structure. A separate generator expands each slide. This gave SlideSurf tighter token control and a more predictable shape than one large model call.",
    },
    {
      kind: "subhead",
      title: "Streaming generation UX",
      text: "Users watch the deck come together slide by slide. The app shows progress while it writes titles, bullet points, and speaker notes — replacing the silent wait common in AI tools with a feeling of momentum.",
    },
    {
      kind: "subhead",
      title: "Multi-provider routing",
      text: "I built one abstraction over OpenAI and Anthropic. The app can change models by task and budget without leaking provider details into the UI, which kept unit economics flexible as model prices shifted.",
    },
    {
      label: "Iteration",
      kind: "logline",
      text: "SlideSurf treats AI output as editable material, not a finished artifact.",
    },
    {
      kind: "case",
      text: "Users can regenerate one slide or refine specific points instead of starting over. That kept the workflow close to how people already edit presentations — surgical changes, not full rewrites — and dramatically lowered the cost of a near-miss generation.",
    },
    {
      kind: "subhead",
      title: "Slide-level regeneration",
      text: "A single slide can be regenerated with new instructions while the rest of the deck stays fixed. The user keeps everything that already works.",
    },
    {
      kind: "subhead",
      title: "Speaker notes by default",
      text: "Every slide ships with speaker notes generated alongside the visible content. Users present from the first draft instead of writing their own talking points later.",
    },
    { kind: "image", aspect: "2460 / 778" },
    {
      label: "Outcomes",
      kind: "outcomes",
      stats: [
        ["8×", "Faster brief-to-deck than manual workflow"],
        ["1.2K+", "Decks generated in first months"],
        ["18%", "Free-to-paid conversion"],
      ],
      text: "SlideSurf launched with real users and a working monetization loop. I covered the full product end-to-end — concept, UX, frontend, backend, prompt architecture, multi-provider LLM integration, and release — and validated that splitting generation into planner and writer was the right product bet.",
    },
  ],
  "clearscale-msp": [
    {
      label: "Challenge",
      kind: "logline",
      text: "ClearScale needed an enterprise MSP portal for clients managing $10M+ in AWS infrastructure. The UI had to support daily operations across billing, services, and accounts without turning cloud complexity into a maze.",
    },
    {
      kind: "case",
      text: "Enterprise AWS clients lived inside the portal. Account managers checked billing and usage daily, engineers monitored service health, and executives expected the same screens to read at a glance. The legacy frontend made every one of those jobs harder than it needed to be.",
    },
    {
      kind: "case",
      text: "The portal needed a full redesign and a frontend migration in parallel. I owned product decisions, UX, UI, and React implementation as the sole designer-developer — which meant design quality and shipping speed depended on the same person.",
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
      kind: "case",
      text: "Doing design and implementation in one loop made the system honest. If a pattern looked clean in Figma but fell apart in code, I caught it the same day. The component library grew out of real screens instead of speculative tokens, and shipped patterns reflected what the data actually looked like in production.",
    },
    {
      kind: "subhead",
      title: "Enterprise dashboard redesign",
      text: "I reorganized the portal around service monitoring, infrastructure state, and account activity. Expert users got the dense views they needed; business stakeholders got the same data legible at a glance.",
    },
    {
      kind: "subhead",
      title: "React migration",
      text: "I led the move to React, TypeScript, Next.js, and Styled Components. Reusable components replaced brittle frontend patterns and gave the team room to add new portal sections without rewriting foundations.",
    },
    {
      kind: "subhead",
      title: "Design and code in one loop",
      text: "Because I owned design and implementation, prototypes became production UI without a long handoff. Build edge cases shaped the design system while decisions were still cheap to change.",
    },
    {
      label: "Context",
      kind: "logline",
      text: "The portal served ClearScale's AWS consulting and managed-services work, where reliability mattered far more than decoration.",
    },
    {
      kind: "case",
      text: "I also worked on data-heavy AWS products during the same period, including data warehouse, data lake, and real-time ingestion workflows. That context shaped how the MSP portal handled operational screens — assume the data is big, assume the user is busy, assume the answer needs to be visible in one glance.",
    },
    {
      kind: "subhead",
      title: "Billing without surprises",
      text: "I redesigned the billing surfaces to surface cost trends, anomalies, and forecast variance in line with how account managers read the numbers — not how the database stored them.",
    },
    {
      kind: "subhead",
      title: "Operational dashboards",
      text: "Service health, incident timelines, and infrastructure state moved to a consistent layout, so engineers could move between accounts without relearning the screen each time.",
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
        ["$10M+", "AWS infrastructure under management"],
        ["−40%", "Time-to-resolve on client requests"],
        ["3×", "Faster onboarding for new enterprise clients"],
      ],
      text: "The redesigned MSP portal gave ClearScale enterprise clients a React-based interface for managed AWS operations and gave internal teams a system they could extend instead of fight. I delivered the work as UI Designer and Frontend Engineer, owning the full path from product decisions to production code.",
    },
  ],
  seligoai: [
    {
      label: "Challenge",
      kind: "logline",
      text: "SeligoAI needed to make student recruitment, retention, and performance data usable for the US education market. Nontechnical users — admissions officers, counselors, faculty — needed ML-backed insights they could act on, not another analytics dump.",
    },
    {
      kind: "case",
      text: "Schools were drowning in data and starving for signal. Spreadsheets, SIS exports, and tutor notes lived in separate corners, and the people who could actually help a student rarely saw the full picture in time. SeligoAI had to turn that scatter into a single, role-aware workflow.",
    },
    {
      kind: "case",
      text: "The platform covered schedules, performance tracking, learning materials, role-based dashboards, predictive analytics, and student success indices. Each role needed a distinct workflow inside one visual language so the institution could roll it out without retraining everyone twice.",
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
      text: "I designed a responsive platform with bright accents, reusable components, and clear dashboard patterns built around action, not exposure.",
    },
    {
      kind: "case",
      text: "Predictive analytics fail when the UI shows a score and stops there. I built the surface to answer the next question — what now, for whom, by when — so ML output translated into work people could pick up the same day.",
    },
    {
      kind: "subhead",
      title: "Design system first",
      text: "I created the core components and UI rules before moving into full pages. That gave the team a base for future sections instead of a pile of one-off screens, and kept later modules visually and behaviorally coherent.",
    },
    {
      kind: "subhead",
      title: "Predictive analytics without jargon",
      text: "The product exposed ML output through success indices and dashboard signals. I focused the UI on actions and status, so users could see where to pay attention without parsing model terminology.",
    },
    {
      kind: "subhead",
      title: "Responsive education workflows",
      text: "I designed the platform for desktop, tablet, and mobile. Schedules, materials, and performance views kept their core data on smaller screens, so faculty could check on a student between classes.",
    },
    {
      label: "Implementation",
      kind: "logline",
      text: "The stack supported fast product development and a component-driven interface I owned end-to-end.",
    },
    {
      kind: "case",
      text: "I worked with Next.js, TailwindCSS, and Webpack, combining product design and frontend implementation. The solo setup let me move from component decisions to working sections in short cycles, with no design-to-engineering translation losses.",
    },
    {
      kind: "subhead",
      title: "Role-based dashboards",
      text: "Admissions, advising, and faculty each landed on a tailored home screen sharing the same components. The institution rolled out one product, not three.",
    },
    {
      kind: "subhead",
      title: "Early-warning signals",
      text: "At-risk indicators surfaced before grades dropped, so advisors could intervene during the term instead of debriefing after it ended.",
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
        ["+30%", "Earlier at-risk student detection"],
        ["5×", "Faster scheduling workflow"],
        ["12+", "US institutions onboarded"],
      ],
      text: "SeligoAI shipped with a design system, core components, and key sections for student management, recruitment, retention, and predictive analytics. The platform gave nontechnical staff ML-backed signals they could act on the same day — and gave the team a foundation to keep extending after I handed it off.",
    },
  ],
  talkpilot: [
    {
      label: "Challenge",
      kind: "logline",
      text: "Power users were juggling subscriptions across GPT, Claude, Gemini, and regional models. TalkPilot brought that work into one product while keeping model tradeoffs visible to the user.",
    },
    {
      kind: "case",
      text: "Switching providers meant switching tabs, contexts, billing, and history. People paid for three or four subscriptions and still couldn't compare answers side by side. The market was crowded with thin frontends — TalkPilot had to feel like a real workspace, not a model-routing wrapper.",
    },
    {
      kind: "case",
      text: "TalkPilot combined multi-model chat, image generation, and web search. Adding providers was the easy part. Pricing, latency, streaming, failures, and model behavior all differ, so the UX needed a consistent surface over deeply uneven infrastructure.",
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
      kind: "case",
      text: "I designed model selection as a first-class part of the chat surface instead of hiding it behind an opaque auto-router. Users could see why one model was better for a given task and switch mid-conversation without losing context — which turned out to be the feature paying users cared about most.",
    },
    {
      kind: "subhead",
      title: "One interface for 20+ models",
      text: "TalkPilot brings GPT, Claude, Gemini, Yandex, and other models into one interface. Users keep their work in one place while picking the model that fits the task — and stop paying for parallel subscriptions.",
    },
    {
      kind: "subhead",
      title: "Visible model tradeoffs",
      text: "I kept model selection visible instead of hiding it behind a vague automatic mode. The UI explains speed, quality, and cost in plain language, so users build their own intuition over time.",
    },
    {
      kind: "subhead",
      title: "Full-stack solo build",
      text: "I owned UX, frontend, backend, and LLM integration. The production stack used React, TypeScript, and Node.js, with provider-specific behavior normalized behind the UI so the user surface stayed coherent.",
    },
    {
      label: "Growth",
      kind: "logline",
      text: "TalkPilot found traction as a solo-built AI tool in a crowded market.",
    },
    {
      kind: "case",
      text: "TalkPilot reached 550+ monthly sign-ups and 12% free-to-paid conversion. ProductRadar selected it as #3 Startup of the Month from 500+ submissions, and a regional accelerator accepted it into a cohort — independent validation that the product solved a real pain, not just packaged a trend.",
    },
    {
      kind: "subhead",
      title: "Image generation and web search included",
      text: "I added image generation and live web search inside the same surface, so users got one product across the modalities they actually mixed in a working session.",
    },
    {
      kind: "subhead",
      title: "Subscription that beats the math",
      text: "One paid plan replaced multiple per-provider subscriptions. The pricing story converted users who were already paying more than TalkPilot cost.",
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
        ["550+", "Monthly sign-ups"],
        ["12%", "Free-to-paid conversion"],
        ["#3", "Startup of the Month, ProductRadar"],
      ],
      text: "TalkPilot shipped with multi-model chat, image generation, and web search, and proved a paid-conversion loop in a market where most AI wrappers never get past free. It gave me a measured solo case across product, design, engineering, LLM integration, and go-to-market.",
    },
  ],
};

interface HeroImage {
  src: string;
  alt: string;
  background?: string;
}

const caseHeroImages: Record<string, HeroImage> = {
  "sber-india-proto": {
    src: "/images/sber-india-proto/hero.png",
    alt: "Sber India prototype tool component grid",
    background: "rgb(248 248 248)",
  },
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
