# garri.design Reference Analysis

This document breaks down the site as a reference for a personal portfolio. It should be used to recreate the interaction model, layout logic, and visual language with original content and original assets.

## High-Level Concept

The site is a minimal, high-confidence product design portfolio built around full-screen scroll states. It feels closer to a presentation deck than a conventional web page.

Core pattern:

- Fixed header is always visible.
- The main area is a full-viewport scroll container.
- Desktop sections snap vertically.
- Each major work item pairs a narrow text column with a large visual artifact.
- The about and recognition sections switch from product proof to personal credibility.
- The final contact block turns the background dark and uses a large closing line.

## Information Architecture

Primary navigation:

- Name / home anchor.
- Work.
- About.
- Contact.

Main sections:

- Hero: short professional positioning statement.
- Featured work 1: fintech/banking app case.
- Featured work 2: super app case.
- Featured work 3: public/data project case.
- Additional work: compact list with one large visual preview.
- About: portrait plus oversized personal statement.
- Side interests: inline image chips embedded inside large text.
- Lectures and mentorship.
- Awards.
- Public speaking and press.
- Contact footer.

## Desktop Layout

Viewport:

- The page is designed around a 100vh experience.
- Minimum desktop section height is about 700px.
- Header remains fixed and consumes the top visual band.

Grid:

- 16-column grid.
- Outer horizontal padding: about 64px on desktop.
- Column gap: about 48px.
- Left case text column spans roughly columns 1-5.
- Main media spans roughly columns 5-16.
- Navigation aligns to the same 16-column grid.

Header:

- Fixed top.
- Left: name.
- Middle: Work and About.
- Right: Contact.
- Desktop text is uppercase-looking through font features rather than heavy styling.
- Header links have generous vertical hit area.

Hero:

- Text starts around column 5.
- Large, light-weight logline.
- No photo, no card, no decorative background.
- Footer-like microcopy on first viewport: location bottom-left, year bottom-right.

Case layout:

- Case section uses a left metadata panel and right visual panel.
- The title is small, uppercase, and matter-of-fact.
- Description is short and split into one or two paragraphs.
- Metadata is table-like with thin horizontal separators.
- Labels are muted; values are darker.
- Media is oversized and clean, often a single composed image.

Footer:

- The final contact block is dark.
- Large white closing statement sits around the same column start as the hero.
- Contact links are below, arranged in grid columns.
- Year sits bottom-right.

## Mobile Layout

Mobile is not a simple scaled-down version. It becomes a long editorial feed.

Key differences:

- Header only shows stacked name at top-left and `@` contact shortcut at top-right.
- Work/About nav is hidden.
- Hero remains first-screen dominant with large whitespace.
- Case metadata collapses into a one-line summary such as years / media.
- Media switches to mobile-specific cropped images.
- Case blocks become vertical: title, arrow, paragraph, metadata line, image.
- About text becomes plain large text with text links instead of inline image chips.
- Snap behavior is visually less important than desktop.

## Typography

Primary font:

- PP Neue Montreal or a close grotesk substitute.
- Recommended substitutes if licensing is unavailable: Neue Haas Grotesk, Helvetica Now, Inter Tight, Geist, or plain system sans as a fallback.

Observed scale:

- Base desktop body: about 14px rendered from rem scaling.
- Desktop logline: about 43px at 1280px viewport, with tight line height.
- Mobile hero/about text: about 28px.
- Case body text: compact, around 14-16px depending viewport.

Font behavior:

- Light weight for hero/about display text.
- Medium weight for small uppercase labels and nav.
- Letter spacing is minimal.
- Case-sensitive OpenType styling is used for uppercase nav-like text.

## Color System

Palette:

- Page background: near-white `#f8f8f8`.
- Primary text: near-black with slight transparency, visually around `rgba(0,0,0,0.86)`.
- Muted text: black at roughly 50% opacity.
- Splitter lines: light gray around `#d4d4d4`.
- Footer dark: near-black around `#121214`.
- Footer text: near-white.

The site avoids decorative color. Color mostly comes from project imagery.

## Motion and Interaction

Desktop scroll:

- Vertical snap sections.
- Each wheel gesture advances the presentation-like state.
- Main page hides native scrollbars.

Custom cursor:

- Native cursor is hidden on desktop.
- A circular custom cursor appears.
- On hover over case media, it expands and shows messages such as `VIEW`, `PLAY`, or `NEXT`.
- Cursor can invert/blend over dark or light areas.

Hover states:

- Case media links use cursor message rather than conventional buttons.
- External links show arrow glyphs.
- The work itself is treated as the click target, not a separate CTA button.

## Media Strategy

The site relies heavily on strong precomposed images.

Required asset types for our version:

- Three large featured case images for desktop.
- Three mobile-specific case images.
- One large image for additional work.
- Portrait image.
- Three small inline images or link replacements for personal interests.
- Optional Open Graph preview image.

Important:

- Images are not decorative. They are the main proof of work.
- Desktop case images are large, clean, and centered in their media column.
- Mobile images are cropped/simplified to fit a feed.

## Content Pattern

Hero formula:

- Current role or positioning.
- Company/domain.
- One craft/value line.

Case formula:

- Title.
- One paragraph describing the situation.
- One paragraph describing the contribution/outcome.
- Metadata rows:
  - Years or Year.
  - Role.
  - Scope.
  - Awards and/or media when relevant.

About formula:

- Origin story or credibility.
- Personal design philosophy.
- Optional creative side interests.

Recognition formula:

- Category title in left column.
- Items in a three-column grid on desktop.
- Item name, external arrow, date/source line.

Contact formula:

- Large optimistic closing line.
- Email.
- Social/profile link.

## Implementation Notes

Recommended implementation:

- Next.js, Astro, or SvelteKit are all suitable.
- Use CSS grid with 16 columns.
- Use CSS scroll snap on desktop.
- Keep mobile as normal vertical flow.
- Build a cursor component only for pointer devices.
- Use original portfolio content and original/generated assets.

Avoid:

- Copying the original text, images, logo SVG, font files, or source code.
- Adding cards around everything.
- Adding gradients or decorative blobs.
- Making a marketing landing page instead of a portfolio.

## Build Checklist

- Create responsive shell with fixed header.
- Define design tokens: colors, type scale, spacing, grid.
- Build desktop snap container.
- Build hero section.
- Build reusable case section.
- Add 3 featured case sections.
- Add additional work section.
- Add about section with portrait.
- Add recognition lists.
- Add dark contact footer.
- Add custom cursor messages.
- Add mobile-specific case layout and images.
- Verify at desktop 1280x720 and mobile 390x844.
