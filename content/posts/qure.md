---
title: Qure
dek: A desktop app where an AI agent turns manual web testing into end-to-end tests in your own repo.
date: 2026-11-03
category: design-engineering
tldr:
  - Qure is a desktop app for QA teams. You record a flow in its built-in browser or describe it in chat, and an AI agent writes the test in your repository and runs it until it passes.
  - I'm the Design Engineer on the team. I design features and ship the UI myself — 76 pull requests merged from 10 August to 14 October 2026.
  - I built the chat-first start, the Tests workspace with its coverage map and insights, and test plans that run from the chat.
  - I also wrote the design system for coding agents, so UI they write matches ours.
  - Electron, React and TypeScript.
stack:
  - Electron
  - React
  - TypeScript
  - Tailwind CSS
links:
  - label: Site
    url: https://quretests.com/
cover: /images/writing/qure/cover-swirl-cold.webp
coverLive: qure-swirl
coverMark: /images/writing/qure/mark.svg
thumb: /images/writing/qure/card-spin-cold.webp
thumbVideo: /images/writing/qure/card-spin-cold.mp4
ogImage: /images/writing/qure/og-swirl-cold.png
---

## Challenge

:::logline
QA teams know what to test. Writing and maintaining the test code is what eats their week.
:::

Recorders produce brittle code nobody wants to keep, and general AI assistants don't know a team's conventions. Qure's agent reads the repo and the running app, so its tests look like the team wrote them. My job is to make that agent easy to direct and easy to trust.

## Solution

:::logline
Show the flow once, get a test that passes.
:::

![Pixel symbols for Qure Demo Day](/images/writing/qure/demo-day-symbols-cold.jpg "full")

I moved Qure to a chat-first start: an empty chat opens on the jobs people come for, not on a dashboard. I also refined the agent's mint cursor, so you always see who is clicking in the page.

## Tests

:::logline
Manual and automated tests in one place, with the last run one click away.
:::

![Blue and gold pixel pattern for Qure Demo Day](/images/writing/qure/demo-day-pattern-cold.jpg "full")

I merged test management into one Tests panel: folders, manual cases kept as Markdown, local and imported runs side by side. A test opens straight on its last run.

## Coverage

:::logline
See what the suite really covers, and what nobody has checked.
:::

![Pixel Qure mark spinning next to animated pixel letters](/images/writing/qure/brand-duo-cold.mp4 "full")

The coverage map links suites, cases and the screens they touch. A link counts as verified only when the last run proves it, and unknown coverage stays visible instead of looking green.

## Test plans

:::logline
Plan a regression run in the chat and get a report back.
:::

I built test plans and then moved the wizard into the chat, so planning, running and reporting are one conversation. The agent can create and edit plans too.

## Design system

:::logline
A design system written for coding agents as much as for people.
:::

Foundations, component specs and product compositions live in plain text that an agent reads before it touches the UI. A dark catalog of the real components runs without a backend, so any change can be checked by eye. Token audits and drift reports flag one-off values, so AI-written UI stays on the system.

![White pixel icons switching in a grid, like an LED matrix](/images/writing/qure/brand-icons-led.mp4 "full")

![Buttons, inputs, a select, a test list and a run progress bar in the new pixel style](/images/writing/qure/brand-components-cold.webp "full")

:::outcomes
- 76 — pull requests merged in nine weeks
- 15 — component specs written for agents
I own features end to end, from the flow and copy to the shipped UI and its end-to-end tests.
:::
