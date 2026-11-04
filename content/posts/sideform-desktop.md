---
title: Sideform Desktop
dek: A macOS app that puts an AI design agent next to your canvas, a real browser and your documents.
date: 2026-10-31
category: design-engineering
tldr:
  - Sideform is an AI design editor. I designed and built its macOS app — the agent docked on the left, canvas, browser and document tabs on the right.
  - I took it from the first spec on 18 July 2026 to v0.9.5 on 1 November — 277 commits, 219 of them co-written with Claude.
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
coverLive: liquid-gradient
coverMark: /images/writing/sideform-desktop/mark.svg
ogImage: /images/writing/sideform-desktop/og.jpg
---

## Challenge

:::logline
Sideform's agent designs on a canvas — but inside a browser tab it was boxed in.
:::

It couldn't browse with the user's logins, couldn't look at other apps, and kept work in the tab's storage. I wanted to give the agent a real desktop to work in.

## Solution

:::logline
One window: the agent on the left, canvas, browser and documents on the right.
:::

![Sideform in the macOS Dock, between Photos and Home](/images/writing/sideform-desktop/dock.webp "full")

An empty window offers a canvas, a site or a brief in one click. I kept the same web editor inside, so every web release lands on the desktop for free.

## Canvas

:::logline
Ask for a screen and watch it appear.
:::

![The agent designs an onboarding screen, then the next screen beside it](/images/writing/sideform-desktop/video-canvas.mp4 "full")

The agent lays out a real screen, with photos and large type, right on the canvas. Ask for the next one and it lands beside the first, in the same style.

## Agent

:::logline
You talk on the left and watch the agent work on the right.
:::

![Typing a task, switching the agent count from x1 to x3 and sending it](/images/writing/sideform-desktop/cu-composer.mp4 "full")

The composer sets how many agents take the task at once. I docked the panel beside every tab and made it hide with Cmd+Option+B, so the canvas gets full width when you need it.

## Browser

:::logline
A browser built for an agent, not only for a person.
:::

:::slider
### Address bar
Type a few letters and the pages you visited come up first.
![Address bar suggestions from history, then the chosen page opens](/images/writing/sideform-desktop/cu-omnibox.mp4)

### Three agents
Each agent gets a named cursor in its own colour, so you see who fills which field.
![Three agent cursors fill a pre-order form together and place the order](/images/writing/sideform-desktop/video-browser.mp4)

### Passwords
The agent signs in with your saved login, and the password never reaches the AI model.
![The agent fills a sign-in form from Passwords and signs in](/images/writing/sideform-desktop/cu-passwords.mp4)
:::

Ads and trackers are blocked by default, and a run can be saved as a trace to step through later.

## Docs

:::logline
The brief lives one tab away from the design.
:::

![The agent writes a launch brief and drops the Home screen into it](/images/writing/sideform-desktop/video-doc.mp4 "full")

The agent writes a brief in a document tab and pulls the screen it just designed straight from the canvas. Select any text and a floating toolbar formats it.

## Control

:::logline
The agent can work in other Mac apps — only after you allow it.
:::

![A native dialog asks before the agent controls Notes; allowing once lets the task finish](/images/writing/sideform-desktop/cu-permission.mp4 "full")

Sideform asks first in a native dialog: allow once or until you quit. Password managers are always blocked.

## On disk

:::logline
Canvases, documents and chats are files on your Mac.
:::

![Filtering the Recent list and reopening a canvas as a tab](/images/writing/sideform-desktop/cu-recent.mp4 "full")

Quitting loses nothing: the app waits for unsaved work to finish writing. Any file reopens from Recent in a couple of keystrokes.

## For coding agents

:::logline
Claude Code and Cursor can edit the open canvas too.
:::

![Settings: turning on MCP control of the built-in browser](/images/writing/sideform-desktop/cu-settings.mp4 "full")

The app runs a local MCP server with 37 tools. Risky switches stay off by default, so outside agents can't drive the browser until you turn it on.

:::outcomes
- 277 — commits from 18 Jul to 1 Nov 2026
- v0.9.5 — shipped 15 weeks after the first spec
- 37 — MCP tools for coding agents
- 219 — commits co-written with Claude
I owned the desktop app end to end, from the window design to the macOS layer, unit and end-to-end tests.
:::
