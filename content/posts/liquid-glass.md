---
title: Liquid Glass
dek: A Claude Code skill that draws iOS 26 Liquid Glass in the browser for product renders, case videos and social posts.
date: 2026-11-24
category: ai-tools
tldr:
  - A Claude Code skill that draws iOS 26 Liquid Glass for renders. The glass bends what passes under it, stays sharp in the middle and catches a thin rainbow at the rim.
  - "Nothing to install: the glass is plain HTML and SVG filters, so any coding agent can use it to make marketing videos with Liquid Glass."
  - I matched every style to real iOS screenshots and screen recordings, side by side. Light, tinted, dark, clear dark, the floating sheet and the tab-bar drag lens are all in.
  - "The glass moves like iOS in recorded video. On top of the skill I built custom lenses for the cover: a picker and a lightning bolt."
  - Open source under MIT. It renders the glass in my Caldera case videos.
stack:
  - Claude Code
  - SVG filters
  - Chromium
  - Playwright
  - ffmpeg
links:
  - label: Code
    url: https://github.com/dan-rozhkov/ios-liquid-glass
cover: /images/writing/liquid-glass/cover-1610.webp
thumb: /images/writing/liquid-glass/thumb.webp
thumbVideo: /images/writing/liquid-glass/trio.mp4
ogImage: /images/writing/liquid-glass/og.jpg
---

## Idea

:::logline
Glass only reads when something moves under it.
:::

In mockups, Liquid Glass is usually a blurred rectangle. I wanted the real thing in my case renders: the backdrop bends at the rim, the middle stays sharp, and the edge catches a thin rainbow. So I built it as a skill Claude reaches for whenever a faux iOS screen needs glass.

It needs nothing extra installed: the whole effect is HTML and SVG filters that render in the browser. That makes it a good fit for Liquid Glass marketing videos made with any coding agent.

![A glass toolbar over a moving gradient, a picker lens that sweeps the rows above into arcs, and a glass lightning bolt bending a running line of type](/images/writing/liquid-glass/trio.mp4 "full")

## Matched to iOS

:::logline
Every value comes from a real screen.
:::

I rebuilt each element at the reference's scale, measured its edges pixel by pixel and compared it side by side with iOS until they matched. If a detail wasn't on the real screen, it didn't go in.

The glass already ships in my work. In the Caldera case, the payment sheet slides up as this glass over the account balance.

![Caldera banking app: the glass payment sheet slides up over the INR balance, then the payment is signed](/images/sber-india-proto/caldera-payment-pair-v3.mp4 "full")

## Motion

:::logline
On iOS the glass reacts to your finger.
:::

The tab-bar selection lifts into a clear lens, stretches as it travels and settles back into a pill. Sliders and switches turn into lenses while you hold them, and a pressed button swells and brightens. Every clip is recorded frame by frame, so each take is exactly the same.

![Glass in motion: a small lens slides across the black ios-liquid-glass label and magnifies its letters, a slider over a rainbow and a blue slider turn into lenses while held, a switch knob crosses as a lens next to the outlined GLASS wordmark, the plus button swells and brightens, and the tab-bar selection slides across the icons as a lens](/images/writing/liquid-glass/reel.mp4 "full")

## Any shape

:::logline
Not just capsules.
:::

For the cover video I took the same lens past capsules: a picker that sweeps the rows above into arcs and a lightning bolt over a running line of type. Over a photo the bend is easiest to see, as the tulips curve around the rim of the toolbar.

![A glass toolbar over pink tulips: stems and petals bend around its rim](/images/writing/liquid-glass/tulips-1610.mp4 "full")

## Outcome

:::outcomes
- 6 — glass styles matched to iOS
- 0 px — changed in existing renders while new options stay off
- MIT — open source on GitHub
Now every iOS screen in my cases gets the same glass, without drawing it by hand.
:::
