import { chromium } from '/Users/daniilrozhkov/prj/dr-portfolio/node_modules/playwright/index.mjs';
const dir = process.cwd();
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: 600, height: 1000 }, deviceScaleFactor: 1.78 });
const out = {};
for (const [ver, html] of [['old', 'v13.html'], ['new', 'v14.html']]) {
  for (const [v, sel] of [['mob2', '.dd'], ['mob3', '.more']]) {
    await p.goto(`file://${dir}/${html}?only=${v}`);
    await p.waitForTimeout(300);
    await p.locator('.view.on .canvas').screenshot({ path: `${ver}-${v}-full.png` });
    out[`${ver}-${v}`] = await p.evaluate((sel) => { const c = document.querySelector('.view.on .canvas').getBoundingClientRect(); const r = document.querySelector('.view.on ' + sel).getBoundingClientRect(); return [r.left - c.left, r.top - c.top, r.width, r.height]; }, sel);
    await p.addStyleTag({ content: `.canvas *{visibility:hidden} .scr,.sheet,${sel},${sel} *{visibility:visible} .scr{background:#fff!important}` });
    if (ver === 'new') await p.evaluate(() => { document.querySelectorAll('svg').forEach(s => { if (s.querySelector('filter')) s.style.visibility = 'visible'; }); });
    await p.waitForTimeout(200);
    await p.locator('.view.on .canvas').screenshot({ path: `${ver}-${v}-btn.png` });
  }
}
console.log(JSON.stringify(out));
await b.close();
