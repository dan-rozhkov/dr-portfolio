---
title: Sideform Desktop
dek: A macOS app that puts an AI design agent next to your canvas, a real browser and your documents.
date: 2026-10-31
category: design-engineering
tldr:
  - Sideform is an AI design editor. I designed and built its macOS app — the agent docked on the left, canvas, browser and document tabs on the right.
  - I took it from the first spec on 18 July 2026 to v0.9.4 on 27 October — 257 commits, 201 of them co-written with Claude.
  - It gives the agent what a browser tab can't — the web with your logins, other Mac apps with your permission, and your work saved on disk.
  - Electron and TypeScript, with a small Swift helper for macOS app control.
stack:
  - Electron
  - TypeScript
  - Swift
  - Vitest
  - Playwright
links:
  - label: Code
    url: https://github.com/dan-rozhkov/pen-editor-desktop
cover: /images/writing/sideform-desktop/cover.webp
ogImage: /images/writing/sideform-desktop/og.jpg
---

## Challenge

:::logline
Sideform's agent designs on a canvas — but inside a browser tab it was boxed in.
:::

It couldn't browse with the user's logins, couldn't look at other apps, and kept work in the tab's storage. I wanted to give the agent a real desktop to work in.

## Solution

:::logline
I designed one window: the agent on the left, canvas, browser and document tabs on the right.
:::

![Start window: agent panel, start cards and Recent list](/images/writing/sideform-desktop/start-window.webp "full")

![Start cards: Canvas, Browser, Document](/images/writing/sideform-desktop/start-cards.webp)

An empty window offers a canvas, a site or a brief in one click. I kept the same web editor inside, so every web release lands on the desktop for free.

## Agent

:::logline
You talk on the left and watch the agent work on the right.
:::

![Agent panel: a prompt, a reply and a finished Design step](/images/writing/sideform-desktop/agent-panel.webp)

I docked the agent beside every tab and made it hide with Cmd+Option+B, so the canvas gets full width when you need it. It slides away instead of jumping, and respects Reduce Motion.

![Chat composer](/images/writing/sideform-desktop/agent-composer.webp)

## Tabs

:::logline
Canvas, web, history and logins live in one tab strip.
:::

:::slider
### Canvas
Design screens with the agent, with pages, layers and export.
![Canvas tab with a focus app home screen](/images/writing/sideform-desktop/tab-canvas.webp)

### Browser
The agent finds references on the open web with your own session. Ads and trackers are blocked by default.
![Built-in browser tab](/images/writing/sideform-desktop/tab-browser.webp)

### History
Visited pages, grouped by day and searchable.
![History tab](/images/writing/sideform-desktop/tab-history.webp)

### Passwords
Saved logins let the agent sign in to a site, and the password never reaches the AI model.
![Passwords tab with demo logins](/images/writing/sideform-desktop/tab-passwords.webp)
:::

## Browser

:::logline
A browser built for an agent, not only for a person.
:::

![Address bar suggestions from history](/images/writing/sideform-desktop/address-suggestions.webp)

The address bar suggests pages you visited. A tab the agent drives shows its cursor, and a run can be saved as a trace to step through.

## Control

:::logline
The agent can work in other Mac apps — only after you allow it.
:::

Sideform asks first in a native dialog: allow once or until you quit. Password managers are always blocked.

![Browser settings: traces, ad blocking, MCP browser control](/images/writing/sideform-desktop/settings-browser.webp)

I kept risky switches off by default, so outside agents can't drive the browser until you allow it.

## Craft

:::logline
It feels like a Mac app, in light and in dark.
:::

![Dark theme](/images/writing/sideform-desktop/dark-theme.webp "full")

The tab bar is translucent glass and follows the editor's theme. Native menus cover open, export, Settings and Reveal in Finder.

## On disk

:::logline
Canvases, documents and chats are files on your Mac.
:::

![Recent list](/images/writing/sideform-desktop/recent-list.webp)

Quitting loses nothing: the app waits for unsaved work to finish writing. Any file reopens from Recent.

## For coding agents

:::logline
Claude Code and Cursor can edit the open canvas too.
:::

The app runs a local MCP server with 37 tools. Install the Sideform agent plugin and it works with no setup and no token to copy.

:::outcomes
- 257 — commits from 18 Jul to 27 Oct 2026
- v0.9.4 — shipped 14 weeks after the first spec
- 37 — MCP tools for coding agents
- 201 — commits co-written with Claude
I owned the desktop app end to end, from the window design to the macOS layer, unit and end-to-end tests.
:::
