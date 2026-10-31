---
title: Biscuit Pet
dek: A cozy iOS virtual pet — a fennec fox you feed, play with, wash and put to bed in short visits.
date: 2026-11-01
category: product-building
tldr:
  - Biscuit Pet is a virtual pet for iPhone. Biscuit lives on while the app is closed, so a 30-second visit always matters.
  - I designed and built it in four days, 28–31 October 2026 — 79 commits, 75 of them co-written with Claude.
  - Biscuit is AI-generated video. I made every pose on fal from one master still, so he looks like the same animal in every clip.
  - Expo and TypeScript, 558 unit tests, with App Store metadata and screenshots ready for release.
stack:
  - Expo
  - React Native
  - TypeScript
  - Zustand
  - fal
cover: /images/writing/biscuit-pet/cover.webp
ogImage: /images/writing/biscuit-pet/og.jpg
---

## Idea

:::logline
A pet for short visits, not a chore that runs your day.
:::

![Header: day counter, Biscuit's avatar and name, paws balance](/images/writing/biscuit-pet/header.webp)

Biscuit gets hungry, bored, sleepy and scruffy while the app is closed, and he is glad when you come back. He never dies, and there are no ads, accounts or purchases.

## Character

:::logline
Biscuit is AI-generated, but he looks like the same animal in every frame.
:::

I wrote a short character bible and made every pose from one master still with nano-banana-pro on fal. Kling and Veo turned the stills into clips, and I matched their colour so moods blend without a jump.

:::slider
### Idle
He stands and breathes while you look.
![Biscuit standing and breathing](/images/writing/biscuit-pet/mood-idle.mp4)

### Happy
Leave him alone for a few seconds and he cheers up on his own.
![Biscuit's happy idle clip](/images/writing/biscuit-pet/mood-happy.mp4)

### Wave
Sometimes he just says hi.
![Biscuit waving](/images/writing/biscuit-pet/mood-wave.mp4)

### Laugh
Tap him and he laughs, with a sound and a haptic tap.
![Biscuit laughing after a tap](/images/writing/biscuit-pet/mood-laugh.mp4)

### Hungry
Below 30% Hunger his ears drop.
![Biscuit looking sad and hungry](/images/writing/biscuit-pet/mood-hungry.mp4)

### Grumpy
Low Joy makes him sulk.
![Biscuit frowning](/images/writing/biscuit-pet/mood-grumpy.mp4)
:::

## Care

:::logline
Four needs, four buttons, no menus.
:::

![Need circles: Hunger, Joy, Sleep and Hygiene](/images/writing/biscuit-pet/needs.webp)

I made each need circle both the meter and the button. The drumstick opens the pantry, the heart opens games, the moon turns off the light and the shower head runs a bath.

![Pantry tray with an apple, toast and a Shop button](/images/writing/biscuit-pet/pantry.webp)

:::slider
### Home
Biscuit is the whole screen. Everything else sits around him.
![Home screen recording with Biscuit's idle moods](/images/writing/biscuit-pet/home.mp4)

### Feed
Pick a snack from the pantry and he chews it on screen.
![Biscuit chewing an apple](/images/writing/biscuit-pet/feed.webp)

### Lights off
He curls up and sleeps, and Sleep comes back.
![Lights off: Biscuit asleep in a curl](/images/writing/biscuit-pet/sleep.webp)

### Shower
Five paws buy a shower cap and a little dance.
![Biscuit in a shower cap under running water](/images/writing/biscuit-pet/shower.webp)
:::

## Mini-games

:::logline
Three mini-games earn the paws that buy his food.
:::

:::slider
### Memory Match
Flip the cards and find six pairs of snacks.
![Memory Match board](/images/writing/biscuit-pet/memory.webp)

### Snack Swap
A 60-second match-three on a 5×5 board.
![Snack Swap board with a 1:00 timer](/images/writing/biscuit-pet/snack-swap.webp)

### Fox Run
Tap to jump over logs and collect paws.
![Fox Run: Biscuit jumping for paw coins](/images/writing/biscuit-pet/fox-run.webp)
:::

Each round raises Joy and costs Sleep, so a tired fox has to nap before he plays again.

![Shop with food cards, prices and effects](/images/writing/biscuit-pet/shop.webp)

Paws buy 21 foods in the shop. Each card shows its price and what it gives, and coffee is the only food that brings Sleep back.

## Events

:::logline
Every visit can bring a small story.
:::

![Event art: Biscuit at a rainy window](/images/writing/biscuit-pet/event-rainy.webp)

I wrote ten small events, each with its own illustration. One shows up when you open the app, at most once an hour, and your choice changes how he feels.

![Event choices: Cuddle up or Splash outside](/images/writing/biscuit-pet/choices.webp)

## Calm

:::logline
Quiet by design.
:::

![Event art: Biscuit curled up in a sunny spot](/images/writing/biscuit-pet/sunny-spot.webp)

Reminders are local and only come when he gets hungry, bored or dirty after you leave. Everything stays on the phone, and fixes ship as over-the-air updates without a new build.

:::outcomes
- 4 days — from first commit to release docs
- 79 — commits, 75 co-written with Claude
- 11 — animated clips of one character
- 558 — unit tests
I owned the whole product: game design, UI, the AI character pipeline, code and App Store prep.
:::
