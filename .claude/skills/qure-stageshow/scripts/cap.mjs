import { chromium } from '/private/tmp/claude-501/-Users-daniilrozhkov-prj-dr-portfolio/45e428e6-c262-46a7-bef2-511cbc0e1932/scratchpad/ss/node_modules/playwright-core/index.mjs';
const out = process.argv[2]; const hashes = process.argv.slice(3);
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' }).catch(async()=>chromium.launch({channel:'chrome'}));
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark' });
for (const h of hashes) { await p.goto('http://127.0.0.1:6106/#' + h); await p.waitForTimeout(1200); await p.screenshot({ path: `${out}/${h}.png` }); }
if (!hashes.length) { await p.goto('http://127.0.0.1:6106/'); await p.waitForTimeout(1500); const links = await p.$$eval('a[href^="#"]', as => as.map(a => a.getAttribute('href'))); console.log(links.join(' ')); await p.screenshot({ path: `${out}/_index.png` }); }
await b.close();
