# Caldera: iOS Liquid Glass in the phone videos

Sources for `caldera-stats-pair-v2` and `caldera-payment-pair-v2` (commit 1cbd898). `caldera-payment-pair-v2` was replaced by `-v3` (glass sheet, left tile re-recorded on top of v2 frames) and removed from `public/`; get it from git history if needed.
The general technique lives in the global Claude skill `ios-liquid-glass`; these files are the Caldera-specific build.

- `v13.html` — the approved Caldera app prototype (from the Notion embed), the base.
- `glass.css`, `glass.js`, `build.py` — inject the glass into v13 → `v14.html` (floating tab bar, glass Monthly/Weekly select, glass "…" button). The `.dd.glass` keeps `margin:-2px 0` so the layout matches v13 pixel for pixel.
- `shot.mjs` — renders the three mobile screens at 1200×2000: `node shot.mjs $PWD/v14.html $PWD/out`.
- `btn.mjs` — renders old and new button-only layers on white at the videos' scale (dpr 1.78).
- `find2.py`, `align.py` — find the render → video scale/offset (stats tile: x 960−50, y −71; payment tile: x −56, y −71) and check alignment.
- `track.py` → `track-*.json` — per-frame offset and opacity of the old button; `patch.py` — writes the patched H.264 video. Then `scripts/encode-video.sh`.

Run everything from this folder; scripts expect the Playwright headless shell 1254 in `~/Library/Caches/ms-playwright/`. Outputs (PNGs, v14.html, frames) are not committed.
