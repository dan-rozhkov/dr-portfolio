import { useEffect, useRef } from "react";
import { assetUrl, caseLink } from "../lib/url";
import { postLink } from "../lib/writingUrl";

interface DrumCase {
  title: string;
  href: string;
  img: string;
  /** Light pictures get a darker scrim so the white title stays readable. */
  light?: boolean;
}

const CASES: DrumCase[] = [
  { title: "Caldera", href: caseLink("caldera"), img: "images/hero/caldera.webp" },
  { title: "Qure", href: postLink("qure"), img: "images/hero/qure.webp" },
  { title: "Sideform", href: postLink("sideform-desktop"), img: "images/hero/sideform.webp" },
  { title: "Suflyor", href: postLink("suflyor"), img: "images/hero/suflyor.webp", light: true },
];

const AUTOPLAY_MS = 2800;
const DRAG_GAIN = 1.1; // drum px per pointer px
const SPRING_K = 90;
const SPRING_D = 19;

interface Glyph {
  el: HTMLSpanElement;
  off: number; // glyph centre relative to the title centre, px of arc
}
interface Item {
  card: HTMLAnchorElement;
  glyphs: Glyph[];
  center: number;
  tw: number;
}

/**
 * Case titles wrapped around a horizontal 3D drum, each with its picture behind it.
 * The drum turns by itself, follows drag/swipe with inertia and snaps to a case;
 * the card tilts after the cursor and sways into the direction of travel.
 * One number (pos, px of arc) drives every transform; no animation library.
 */
export default function CaseDrum() {
  const stageRef = useRef<HTMLDivElement>(null);
  const drumRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const drum = drumRef.current;
    const count = countRef.current;
    if (!stage || !drum || !count) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = [...drum.querySelectorAll<HTMLAnchorElement>(".case-drum-card")];

    // ---- layout ----
    let fs = 0, R = 1, Rc = 1, gap = 0, total = 1;
    let items: Item[] = [];

    const build = (fsIn?: number) => {
      const w = stage.clientWidth;
      fs = fsIn ?? Math.round(Math.min(Math.max(w * 0.085, 56), 150));
      const cw = Math.round(fs * 2.3);
      R = fs * 3.2;
      Rc = R - fs * 0.9;
      gap = fs * 3.4;
      stage.style.setProperty("--fs", `${fs}px`);
      stage.style.setProperty("--cw", `${cw}px`);
      stage.style.setProperty("--ch", `${Math.round((cw * 10) / 16)}px`);
      drum.querySelectorAll(".case-drum-glyph").forEach((g) => g.remove());
      const probe = document.createElement("span");
      probe.className = "case-drum-glyph";
      probe.style.visibility = "hidden";
      drum.append(probe);
      items = [];
      let s = 0;
      CASES.forEach((c, ci) => {
        const glyphs: Glyph[] = [];
        let prev = 0;
        const raw: { el: HTMLSpanElement; x: number; w: number }[] = [];
        for (let i = 0; i < c.title.length; i++) {
          probe.textContent = c.title.slice(0, i + 1); // advance incl. kerning
          const x = probe.getBoundingClientRect().width;
          const el = document.createElement("span");
          el.className = "case-drum-glyph";
          el.textContent = c.title[i];
          el.setAttribute("aria-hidden", "true");
          drum.append(el);
          raw.push({ el, x: prev, w: x - prev });
          prev = x;
        }
        const tw = prev;
        for (const g of raw) glyphs.push({ el: g.el, off: g.x + g.w / 2 - tw / 2 });
        items.push({ card: cards[ci], glyphs, center: s + tw / 2, tw });
        s += tw + gap;
      });
      probe.remove();
      total = s;
      const maxTw = Math.max(...items.map((i) => i.tw));
      const fit = (w * 0.8) / (maxTw * 1.32); // the front is magnified ~1.3x by perspective
      if (fit < 1 && fsIn === undefined) return build(fs * fit);
      if (maxTw / 2 / R > 0.85) {
        R = maxTw / 1.7;
        Rc = R - fs * 0.9;
      }
      stage.style.setProperty("--persp", `${Math.round(R * 3.4)}px`);
    };

    const wrap = (v: number) => (((v % total) + total * 1.5) % total) - total / 2;
    const deg = 180 / Math.PI;

    // ---- render ----
    let lastPos: number | null = null, lastT = 0, sway = 0, swayV = 0, glyphPos = NaN;
    const render = (pos: number, tiltX: number, tiltY: number, t: number) => {
      const moveGlyphs = Math.abs(pos - glyphPos) > 0.01 || Number.isNaN(glyphPos);
      if (moveGlyphs) glyphPos = pos;
      const dt = Math.min(0.05, Math.max(0.001, (t - lastT) / 1000));
      const v = lastPos === null ? 0 : (pos - lastPos) / dt;
      lastPos = pos;
      lastT = t;
      if (!reduced) {
        // lean into the direction of travel, swing back with a small overshoot
        const target = Math.max(-16, Math.min(16, (-v / fs) * 2.2));
        swayV += (170 * (target - sway) - 13 * swayV) * dt;
        sway += swayV * dt;
      }
      const wob = reduced ? 0 : Math.sin(t / 1400) * 1.2;
      for (const it of items) {
        const dc = wrap(it.center - pos);
        const near = Math.max(0, 1 - Math.abs(dc) / (it.tw / 2 + gap));
        const vis = Math.abs(dc / Rc) < Math.PI / 2;
        it.card.style.visibility = vis ? "visible" : "hidden";
        if (vis) {
          const rx = (tiltX + wob * 0.6) * near;
          const ry = (tiltY + wob) * near + sway;
          it.card.style.transform = `rotateY(${(dc / Rc) * deg}deg) translateZ(${Rc}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${sway * 0.18}deg)`;
        }
        if (!moveGlyphs) continue;
        for (const g of it.glyphs) {
          const a = wrap(it.center + g.off - pos) / R;
          const show = Math.abs(a) < 1.45;
          g.el.style.visibility = show ? "visible" : "hidden";
          if (!show) continue;
          g.el.style.opacity = Math.min(1, Math.max(0, (1.38 - Math.abs(a)) / 0.3)).toFixed(3);
          g.el.style.transform = `rotateY(${a * deg}deg) translateZ(${R}px) translateX(-50%)`;
        }
      }
    };

    // ---- motion ----
    let index = 0, pos = 0, vel = 0, target = 0;
    let tiltX = 0, tiltY = 0, tX = 0, tY = 0;
    let dragging = false, idleAt = performance.now(), last = 0, raf = 0;
    let onScreen = true, ready = false, focused = false;
    // No pause on hover: the drum fills most of the first screen, so the cursor is nearly always over it.
    const paused = () => reduced || dragging || focused;

    const nearestIndex = (p: number) => {
      let best = 0, bd = Infinity;
      items.forEach((it, i) => {
        const d = Math.abs(wrap(it.center - p));
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    };
    const setIndex = (i: number) => {
      const n = items.length;
      index = ((i % n) + n) % n;
      count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
      cards.forEach((c, ci) => c.setAttribute("aria-current", ci === index ? "true" : "false"));
    };
    const goTo = (i: number) => {
      if (!ready) return;
      setIndex(i);
      target = pos + wrap(items[index].center - pos); // shortest way round
      if (reduced) { pos = target; vel = 0; }
      idleAt = performance.now();
      kick();
    };

    const frame = (t: number) => {
      raf = 0;
      const dt = Math.min(0.033, (t - (last || t)) / 1000);
      last = t;
      if (!dragging) {
        vel += (SPRING_K * (target - pos) - SPRING_D * vel) * dt;
        pos += vel * dt;
      }
      tiltX += (tX - tiltX) * Math.min(1, dt * 6);
      tiltY += (tY - tiltY) * Math.min(1, dt * 6);
      if (paused()) idleAt = t;
      else if (t - idleAt > AUTOPLAY_MS) {
        goTo(index + 1);
        idleAt = t;
      }
      render(pos, tiltX, tiltY, t);
      // Reduced motion has no wobble or autoplay: stop once everything has settled.
      const settled =
        reduced && !dragging && Math.abs(target - pos) < 0.05 && Math.abs(vel) < 0.05 &&
        Math.abs(tX - tiltX) < 0.01 && Math.abs(tY - tiltY) < 0.01;
      if (onScreen && !document.hidden && !settled) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const kick = () => {
      if (ready && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
    };

    // ---- input ----
    let px = 0, pv = 0, pt = 0, moved = 0;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !ready) return;
      dragging = true; moved = 0; px = e.clientX; pt = performance.now(); pv = 0; vel = 0;
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        const r = stage.getBoundingClientRect();
        tX = -((e.clientY - r.top) / r.height - 0.5) * 12;
        tY = ((e.clientX - r.left) / r.width - 0.5) * 16;
        kick();
      }
      if (!dragging) return;
      const now = performance.now(), dx = e.clientX - px;
      moved += Math.abs(dx);
      // capture only once it is a real drag: capturing on pointerdown would steal the card's click
      if (moved > 6 && !stage.hasPointerCapture(e.pointerId)) stage.setPointerCapture(e.pointerId);
      pos -= dx * DRAG_GAIN;
      target = pos;
      pv = 0.8 * ((-dx * DRAG_GAIN) / Math.max(1, now - pt)) * 1000 + 0.2 * pv;
      px = e.clientX; pt = now;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      vel = pv;
      goTo(nearestIndex(pos + pv * 0.22));
    };
    const onLeave = () => { tX = 0; tY = 0; };
    // detail 0 = keyboard activation: never block it because of an earlier drag
    const onClick = (e: MouseEvent) => {
      if (e.detail > 0 && moved > 6) { e.preventDefault(); e.stopPropagation(); }
    };
    let wheelT = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical wheel scrolls the page
      e.preventDefault();
      const now = performance.now();
      if (now - wheelT > 380 && Math.abs(e.deltaX) > 4) {
        goTo(index + Math.sign(e.deltaX));
        wheelT = now;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
    };
    const onFocus = (e: FocusEvent) => {
      focused = true;
      const i = cards.indexOf(e.target as HTMLAnchorElement);
      if (i >= 0 && i !== index) goTo(i);
    };
    const onBlur = (e: FocusEvent) => {
      if (!stage.contains(e.relatedTarget as Node | null)) focused = false;
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    // window, not stage: a release outside the drum before capture kicks in must still end the drag
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("click", onClick, true);
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("keydown", onKey);
    stage.addEventListener("focusin", onFocus);
    stage.addEventListener("focusout", onBlur);

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      idleAt = performance.now();
      kick();
    });
    io.observe(stage);
    const onVis = () => { idleAt = performance.now(); kick(); };
    document.addEventListener("visibilitychange", onVis);

    let resizeT = 0;
    let lastW = 0;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        if (!ready || stage.clientWidth === lastW) return; // mobile URL bar show/hide changes only height
        lastW = stage.clientWidth;
        build();
        pos = target = items[index].center;
        vel = 0;
        kick();
      }, 120);
    };
    window.addEventListener("resize", onResize);

    let cancelled = false;
    document.fonts.load('500 100px "General Sans"').finally(() => {
      if (cancelled) return;
      build();
      lastW = stage.clientWidth;
      ready = true;
      setIndex(0);
      pos = target = items[0].center;
      stage.classList.add("is-ready");
      kick();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("click", onClick, true);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("keydown", onKey);
      stage.removeEventListener("focusin", onFocus);
      stage.removeEventListener("focusout", onBlur);
      drum.querySelectorAll(".case-drum-glyph").forEach((g) => g.remove());
    };
  }, []);

  return (
    <div
      className="case-drum"
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected cases"
      data-cursor="DRAG"
    >
      <div className="case-drum-scene">
        <div className="case-drum-axis" ref={drumRef}>
          {CASES.map((c) => (
            <a
              key={c.title}
              className="case-drum-card"
              href={c.href}
              draggable={false}
              data-cursor="OPEN"
              data-light={c.light ? "" : undefined}
            >
              <img src={assetUrl(c.img)} alt="" draggable={false} decoding="async" />
              <span className="visually-hidden">{c.title}</span>
            </a>
          ))}
        </div>
      </div>
      <span className="case-drum-count" ref={countRef} aria-hidden="true" />
    </div>
  );
}
