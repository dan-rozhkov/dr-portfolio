// node record.mjs <scene> <out.mp4> [seconds=16] [scale=2.4] [--loopfade]
import { chromium } from 'playwright-core'
import { mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const [scene, out, secs = '16', scale = '2.4'] = process.argv.slice(2)
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage({ viewport: { width: 800, height: 450 }, deviceScaleFactor: Number(scale), colorScheme: 'dark', reducedMotion: 'no-preference' })
p.on('pageerror', (e) => console.error('pageerror', e.message))
await p.goto(`http://127.0.0.1:5390/?record=${scene}`)
for (let t = 0; t < 150 && !(await p.evaluate(() => !!(window.__recordReady && window.__stageshow?.clock))); t++) await new Promise((r) => setTimeout(r, 100))
for (let t = 0; t < 30; t++) await p.evaluate(() => window.__stageshow.clock.settle())
await p.addStyleTag({ content: 'html,body{margin:0!important;padding:0!important;background:#0e0e0e!important;overflow:hidden!important} #root{display:block!important}' })
const stage = await p.$('.ss-stage')
const box = await stage.boundingBox()
const dir = out.replace(/\.mp4$/, '') + '-frames'
rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true })
const frames = Math.round(Number(secs) * 30)
for (let i = 0; i < frames; i++) {
  await p.evaluate(() => window.__stageshow.clock.step(1))
  await p.screenshot({ path: `${dir}/${String(i).padStart(5, '0')}.png`, clip: box })
}
await b.close()
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', `${dir}/%05d.png`, '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out])
console.log('wrote', out, frames, 'frames', JSON.stringify(box))
