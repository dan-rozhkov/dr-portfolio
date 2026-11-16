// node shot.mjs <html> <outPrefix>  → <outPrefix>-mob.png, -mob2.png, -mob3.png at 1200×2000
import { chromium } from '/Users/daniilrozhkov/prj/dr-portfolio/node_modules/playwright/index.mjs';
const [, , html, out] = process.argv;
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: 600, height: 1000 }, deviceScaleFactor: 2 });
for (const v of ['mob', 'mob2', 'mob3']) {
  await p.goto('file://' + html + '?only=' + v);
  await p.waitForTimeout(400);
  await p.locator('.view.on .canvas').screenshot({ path: `${out}-${v}.png` });
}
await b.close();
