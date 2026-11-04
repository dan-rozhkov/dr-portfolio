---
name: qure-stageshow
description: Use when making or re-rendering a promo video of Qure (JetBrains, ~/prj/qure-app) for the portfolio — "видео про Qure", "перезапиши ролик Qure", a new Qure scene for the post. A layer on the global stageshow skill: Qure's real dark UI, the mint agent cursor, and a frame-exact MP4 recorder.
---

# Stageshow for Qure

A layer on the global `stageshow` skill (load it first, follow its workflow). Stageshow decides framing, story and motion; this layer decides the look (real Qure UI) and how videos are rendered. Qure may appear **only on the portfolio site** and only with work Danil shipped (see the blog-post skill's Qure rule).

## Set up

```bash
S=<scratch>
cp -R ~/.agents/skills/stageshow/{kit,playground,scripts,examples,teaching,assets,package.json,package-lock.json} $S/ss && cd $S/ss && npm ci
cp -R <this skill>/scenes/* examples/
npx vite playground --config playground/vite.config.ts --port 5390 --strictPort --host 127.0.0.1 &
```

Add the recorder route to `playground/main.tsx`, at the top of `boot()`:

```ts
if (params.has('record')) {
  installVirtualClock({ fps: 30 })
  const { mount } = await import('./preview')
  await mount(params.get('record')!, false)
  ;(window as any).__recordReady = true
  return
}
```

Then `cp <this skill>/scripts/record.mjs $S/ss/` and render with `node record.mjs <scene> out/<scene>.mp4 <seconds>`: it steps the kit's virtual clock one frame at a time, screenshots the 800×450 stage at 2.4× and encodes H.264 1920×1080 30 fps. Inspect a contact sheet of the frames and the last frame; trim long end holds with ffmpeg `-frames:v`. A new example folder may need `touch playground/preview.tsx` before Vite sees it.

Reference UI: run the component book from a worktree of qure-app (`cd frontend && npm ci --ignore-scripts && npx vite --config component-book/vite.config.ts --port 6106`) and capture pages with `node scripts/cap.mjs <out dir> <hash…>` (edit its playwright import path to the stageshow folder).

## Look (from qure-app frontend/src/renderer/styles/tokens.css, dark)

- Background `oklch(.209 0 0)`, card `oklch(.2645 0 0)`, secondary `oklch(.3132 0 0)`, muted fg `oklch(.7572 0 0)`, border white 10%, input white 15%, brand mint `oklch(.8635 .0952 180.52)`, success `#34d399`. Font Geist (woff2 in `scenes/qure-shared/fonts`). Icons: lucide, 16px, stroke 1.75.
- Topbar 40px; chat column 360px (narrower is fine when the right pane is the hero); built-in browser with back/forward/reload and a URL field.
- Agent cursor: `AutomationCursorOverlay` arrow (`2.2,1.6 17.6,8.5 10.8,12.4 6.2,17.7`), white 7.8 outline, mint 5.4 fill, press scale .85, mint ripple. Use `AgentCursor` from `scenes/qure-shared/parts.tsx`; the user's own pointer is the kit cursor.
- Framing: window corner at 28,28, gutter 28 top/left/bottom, bleeding off the right edge. Dark only.

## Scenes

`scenes/qure-shared` (chrome, composer, cursor, CSS) and four finished scenes: `qure-record` (record a flow → agent writes and replays the test), `qure-tests` (Tests workspace → last run replay with steps), `qure-coverage` (coverage map), `qure-plan` (test plan in chat → run → report).
