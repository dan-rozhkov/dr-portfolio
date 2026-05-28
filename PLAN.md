# Portfolio Case Study Content Plan

## Source Notes

- Super.site target: `https://daniil-rozhkov-en.super.site`. Direct capture was attempted first, but this environment could not resolve `daniil-rozhkov-en.super.site` through DNS. The implementation will use the same facts from local `my-career-path` source files and the case facts in the task brief.
- Local project files read:
  - `/Users/daniilrozhkov/prj/my-career-path/Projects/Live Studio.md`
  - `/Users/daniilrozhkov/prj/my-career-path/Projects/SlideSurf.md`
  - `/Users/daniilrozhkov/prj/my-career-path/Projects/Sber India Prototype Tool.md`
  - `/Users/daniilrozhkov/prj/my-career-path/raw/archive/Projects/Openprovider Design System.md`
  - `/Users/daniilrozhkov/prj/my-career-path/raw/archive/Projects/SeligoAI.md`
  - `/Users/daniilrozhkov/prj/my-career-path/raw/archive/Projects/TalkPilot.md`
  - `/Users/daniilrozhkov/prj/my-career-path/Experience/Openprovider.md`
  - `/Users/daniilrozhkov/prj/my-career-path/Experience/Clearscale.md`
  - `/Users/daniilrozhkov/prj/my-career-path/Experience/Personal Projects.md`
- Current portfolio state:
  - `src/data/portfolio.js` has three full cases: `live-studio`, `openprovider`, `slidesurf`.
  - All case pages use the generic `placeholderSections()` content.
  - ClearScale MSP, SeligoAI, and TalkPilot appear only as supporting work or recognition references.

## Existing Case Studies To Update

1. `live-studio`
   - Keep existing `id`, `title`, `visual`.
   - Replace generated placeholder sections with real content about the open-source visual CSS editor for AI agents.
   - Structure: challenge around AI agents lacking visual feedback, solution through MCP/WebSocket/Shadow DOM/editor panel, implementation decisions, outcomes with npm package and MIT license.

2. `openprovider`
   - Keep existing `id`, `title`, `visual`, `variant`.
   - Replace placeholder sections with the reseller dashboard and design system story.
   - Structure: challenge around a business-critical multilingual reseller dashboard, solution through full UX redesign and design system, collaboration across Netherlands and India, outcomes with 15K+ resellers, 100+ screens, 4 months, EN/ES/RU.

3. `slidesurf`
   - Keep existing `id`, `title`, `visual`.
   - Replace placeholder sections with the launched AI presentation generator story.
   - Structure: challenge around turning a prompt into a useful deck, solution through planner/content-generator architecture and streaming UI, multi-provider routing, outcomes with launched product and OpenAI/Claude stack.

## New Full Case Studies To Add

4. `clearscale-msp`
   - Title: `ClearScale MSP Portal`.
   - Add to `cases` so it appears on the homepage.
   - Structure: enterprise AWS managed-services portal, complete redesign, React frontend migration, sole designer-developer role, outcomes with $10M+ AWS infrastructure and 2018-2021 timeframe.

5. `seligoai`
   - Title: `SeligoAI`.
   - Add to `cases` so it appears on the homepage.
   - Structure: US-market student management platform, role-based dashboards, predictive analytics and success indices, bright accent system, responsive design, Next.js/TailwindCSS/Webpack.

6. `talkpilot`
   - Title: `TalkPilot`.
   - Add to `cases` so it appears on the homepage.
   - Structure: neural network aggregator, 20+ LLMs, chat/image/web search, visible model choice for power users, React/TypeScript/Node.js, outcomes with ProductRadar #3, 500+ submissions, 550+ monthly sign-ups, 12% free-to-paid conversion, accelerator.

## Main Page Updates

- Add the three new cases to the `cases` array.
- Update `extraWork` so moved projects no longer appear as tabs.
- Keep Sber India Prototype Tool and LucidBots as supporting work.
- Keep recognition links pointing to full case ids where possible.

## Order Of Work

1. Replace `placeholderSections()` with explicit section arrays keyed by case id.
2. Add ClearScale MSP, SeligoAI, and TalkPilot to `cases`.
3. Update `caseStudies` construction to pull each case's real sections without changing the exported API.
4. Update `extraWork` and recognition links after moving projects into full cases.
5. Run a humanization pass over `src/data/portfolio.js`: remove filler, em dashes, generic claims, and inflated wording.
6. Run `npm run build` and fix any errors.
7. Commit with `feat: replace placeholder case studies with real content from super.site and my-career-path`.
8. Push to `origin main`.
