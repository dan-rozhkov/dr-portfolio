---
title: Sideform Desktop
dek: A macOS app that puts an AI design agent next to your canvas, a real browser and your documents.
date: 2026-10-31
category: design-engineering
tldr:
  - Sideform is an AI design editor. Sideform Desktop is its macOS app — a chat agent on the left, canvas, browser and document tabs on the right.
  - I designed and built the desktop app, from the first sketch on 18 July 2026 to version 0.9.4 on 27 October — 257 commits, most of them co-written with Claude.
  - It lets the agent do what a web page can't — browse the web with your logins, work inside other Mac apps, and keep canvases, documents and chats on disk.
  - Built with Electron and TypeScript, plus a small Swift helper for controlling other macOS apps.
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
---

## Why a desktop app

Sideform started as a design editor in the browser, with an AI agent that draws on the canvas for you. A browser tab sets limits on that agent. It can't open other websites with your accounts, it can't look at other apps, and your work lives in the tab's storage.

The desktop app removes those limits. It wraps the same editor, so every improvement to the web version shows up in the app too, and adds what only a native app can do.

## The agent sits beside your work

The window has two parts. On the left is the agent chat. On the right are tabs: canvases, web pages and Markdown documents. You talk to the agent on the left and watch it work on the right.

- An empty window asks "Where shall we start?" and offers three cards: a new canvas, a new browser tab or a new document. Below them is a list of recent canvases and documents, newest first.
- Tabs can be dragged to a new order. Cmd+T opens a canvas. The chat panel hides and shows again with one button or Cmd+Option+B, and slides out of the way instead of jumping (it stays still if you turned on Reduce Motion in macOS).
- Native menus and shortcuts: open, export, Settings (Cmd+,), Reveal in Finder.
- On macOS the tab bar is translucent glass, and the app follows the editor's light or dark theme.

## A browser the agent can use

A design agent needs references. The built-in browser lets it find them on the open web — Pinterest, for example — with your own logged-in session.

- Ads and trackers are blocked by default.
- History works like in any browser: the address bar suggests pages you visited, and a History tab lists them.
- You can save logins. The agent can sign in to a site with them, and the password never reaches the AI model.
- While the agent drives a tab, that tab shows the agent's cursor, so you always see where it is working.
- For testing, the agent can run several checks at once, each in its own private browser with separate cookies and accounts.
- Each browsing run is saved as a trace. You open it in a tab and step through what the agent saw and did.

## Beyond the browser: other apps on your Mac

The agent can also work inside other apps that are already open on your Mac — native apps and Electron apps — without restarting them. It reads the window, clicks, types and scrolls, and draws its cursor over the app so you can follow it.

You stay in control. Every time the agent wants to use another app, the app asks you first in a native dialog. Password managers are always blocked. macOS asks for Accessibility permission, and Screen Recording only if the agent needs screenshots.

## Your work stays on disk

Canvases, documents and agent chats are saved as files on your computer. Closing a tab or quitting the app doesn't lose anything: on quit, the app waits for unsaved work to finish writing first.

- Reopen any canvas or document from the Recent list.
- Right-click a tab or a Recent item to show its file in Finder.
- Save a document as a PDF.
- Sign in through your usual browser; the app picks up the session securely.

## Works with Claude Code and Cursor

The app also runs a local MCP server. Install the app and the Sideform agent plugin, and a coding agent like Claude Code or Cursor can read and edit the document you have open — 37 tools, with no setup and no token to copy. It works only on your computer, and letting outside agents control the built-in browser is off until you turn it on in Settings.

## How it's built

An Electron shell around the deployed web editor, with the AI agent running on Sideform's server. A small Swift helper does the macOS app control. Unit tests run on Vitest and end-to-end tests on Playwright, plus a separate test that runs the app against the live editor and agent.
