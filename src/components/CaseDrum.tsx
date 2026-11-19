import { useEffect, useRef } from "react";
import { assetUrl, caseLink } from "../lib/url";
import { postLink } from "../lib/writingUrl";
import { LiveCover } from "./LiveCover";
import { videoSize, videoSources } from "./video";

type DrumCase = {
  title: string;
  href: string;
} & (
  | {
      /** Full case video, 16:10; cropped to fill the drum. */
      video: string;
      /** First frame of the video, shown until it plays and under reduced motion. */
      poster: string;
      /** A 2:3 cut for phones, when the subject can't fit the centre third of the landscape video. */
      portrait?: { video: string; poster: string };
    }
  | {
      /** The Sideform landing's live gradient with the mark, as on the post cover. */
      gradient: { fallback: string; mark: string };
    }
);

const CASES: DrumCase[] = [
  {
    title: "Caldera",
    href: caseLink("caldera"),
    video: "images/hero/caldera-logo.mp4", // the case card's logo video
    poster: "images/hero/caldera-logo.webp",
    // the wordmark is wider than a phone's crop: same video, fitted to the width over its own blur
    portrait: { video: "images/hero/caldera-logo-portrait.mp4", poster: "images/hero/caldera-logo-portrait.webp" },
  },
  { title: "Qure", href: postLink("qure"), video: "images/hero/qure-full.mp4", poster: "images/hero/qure-full.webp" },
  {
    title: "Sideform",
    href: postLink("sideform-desktop"),
    gradient: {
      fallback: "images/writing/sideform-desktop/cover.webp",
      mark: "images/writing/sideform-desktop/mark.svg",
    },
  },
  {
    title: "Suflyor",
    href: postLink("suflyor"),
    // 3 s of the logo, then the phone from the case, re-recorded less close (.work/hero-anim/suflyor/build.sh)
    video: "images/hero/suflyor-full.mp4",
    poster: "images/hero/suflyor-full.webp",
    portrait: { video: "images/hero/suflyor-portrait.mp4", poster: "images/hero/suflyor-portrait.webp" },
  },
];

/**
 * A case stays in front until its video ends, then the drum turns to the next one.
 * Safety nets, so the drum never sticks: a video that can't play at all hands over after
 * BLOCKED_MS; one that stops making progress (slow network, decode stall) after STALL_MS.
 * A case without a video (the gradient) stays for STILL_MS.
 */
const BLOCKED_MS = 5000;
const STALL_MS = 8000;
const STILL_MS = 7000;
/** Phones in portrait get a case's `portrait` cut; same breakpoint as --bp-mobile (900px). */
const PORTRAIT_MEDIA = "(orientation: portrait) and (max-width: 900px)";
const DRAG_GAIN = 1.1; // drum width per pointer width
const SPRING_K = 90;
const SPRING_D = 19;

/**
 * Full-bleed case panels on the faces of a horizontal drum (four cases: a cube). The front
 * face fills the block exactly; between cases the drum turns, pulls back a little and rolls
 * into the direction of travel. It turns by itself, follows drag/swipe with inertia and
 * snaps to a case. One number (pos, in faces) drives every transform; no animation library.
 */
export default function CaseDrum() {
  const stageRef = useRef<HTMLDivElement>(null);
  const drumRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const drum = drumRef.current;
    const count = countRef.current;
    const title = titleRef.current;
    if (!stage || !drum || !count || !title) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = [...drum.querySelectorAll<HTMLAnchorElement>(".case-drum-card")];
    const videos = cards.map((c) => c.querySelector("video"));
    const gradients = cards.map((c) => c.querySelector<HTMLCanvasElement>(".live-cover-canvas"));
    const n = cards.length;
    const step = 360 / n; // degrees per face

    // ---- layout ----
    let W = 1, apothem = 1;
    const build = () => {
      W = stage.clientWidth;
      apothem = W / 2 / Math.tan(Math.PI / n);
      stage.style.setProperty("--persp", `${Math.round(Math.max(W, 900) * 1.2)}px`);
    };

    const wrap = (v: number) => (((v % n) + n * 1.5) % n) - n / 2; // faces, into [-n/2, n/2)

    // ---- render ----
    let lastPos: number | null = null, lastT = 0, sway = 0, swayV = 0;
    const render = (pos: number, t: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (t - lastT) / 1000));
      const v = lastPos === null ? 0 : (pos - lastPos) / dt; // faces per second
      lastPos = pos;
      lastT = t;
      if (!reduced) {
        // roll into the direction of travel, swing back with a small overshoot
        const target = Math.max(-3, Math.min(3, -v * 2.4));
        swayV += (170 * (target - sway) - 13 * swayV) * dt;
        sway += swayV * dt;
      }
      // half way between two cases the drum sits furthest back
      const between = Math.sin(Math.PI * Math.abs(pos - Math.round(pos)));
      const back = reduced ? 0 : between * W * 0.14;
      drum.style.transform = `translateZ(${-apothem - back}px) rotateZ(${sway}deg)`;
      cards.forEach((card, i) => {
        const dc = wrap(i - pos);
        // faces turned away are culled by backface-visibility; they stay focusable for Tab
        card.style.transform = `rotateY(${dc * step}deg) translateZ(${apothem}px)`;
      });
    };

    // ---- motion ----
    let index = 0, pos = 0, vel = 0, target = 0;
    let dragging = false, idleAt = performance.now(), last = 0, raf = 0;
    let onScreen = false, ready = false, focused = false; // the IntersectionObserver sets onScreen
    // No pause on hover: the drum fills most of the first screen, so the cursor is nearly always over it.
    const paused = () => reduced || dragging || focused;

    // ---- video: only the front card plays, from its start; its `ended` turns the drum ----
    // React doesn't write `muted` into prerendered HTML and hydration doesn't set it,
    // and browsers only autoplay muted video.
    videos.forEach((v) => { if (v) v.muted = true; });

    // The prerendered markup carries the landscape cut. Swap in the portrait cut on phones in
    // portrait (in JS, not <source media>, so older browsers never get it on desktop, and so
    // it follows rotation).
    const portraitMq = matchMedia(PORTRAIT_MEDIA);
    const applyCuts = () => {
      CASES.forEach((c, i) => {
        const v = videos[i];
        if (!v || !("video" in c) || !c.portrait) return;
        const cut = portraitMq.matches ? c.portrait : c;
        const first = v.querySelector("source");
        const next = videoSources(cut.video);
        if (first?.getAttribute("src") === next[0].src) return;
        v.replaceChildren(...next.map((x) => Object.assign(document.createElement("source"), x)));
        v.poster = assetUrl(cut.poster);
        const size = videoSize(cut.video);
        if (size) { v.width = size.width; v.height = size.height; }
        v.load();
      });
    };
    applyCuts();
    let playGen = 0, blocked = false, progressAt = performance.now();
    const syncVideos = () => {
      // clientWidth is 0 while the drum is hidden (desktop): then nothing plays or preloads
      const live = !reduced && ready && onScreen && !document.hidden && stage.clientWidth > 0;
      // the gradient only animates while its face is in front
      gradients.forEach((g, gi) => {
        if (!g) return;
        const hold = !(live && gi === index);
        if (g.dataset.paused === String(hold)) return;
        g.dataset.paused = String(hold);
        if (!hold) g.dispatchEvent(new Event("gradientresume"));
      });
      if (live) {
        // preload the next video case so its turn doesn't wait for the network
        for (let k = 1; k < n; k++) {
          const next = videos[(index + k) % n];
          if (next) { next.preload = "auto"; break; }
        }
      }
      videos.forEach((v, vi) => {
        if (!v) return;
        if (vi !== index) {
          if (!v.paused) v.pause();
          if (v.currentTime > 0) v.currentTime = 0; // next time it comes round it starts over
          return;
        }
        if (!live) { if (!v.paused) v.pause(); return; }
        v.preload = "auto";
        const gen = ++playGen;
        blocked = false;
        progressAt = performance.now();
        v.play().catch((err: unknown) => {
          // an interrupted play() (we paused it ourselves) is not a failure
          if (gen === playGen && !(err instanceof DOMException && err.name === "AbortError")) blocked = true;
        });
      });
    };
    const onProgress = (e: Event) => {
      if (videos.indexOf(e.target as HTMLVideoElement) === index) progressAt = performance.now();
    };
    const onEnded = (e: Event) => {
      const vi = videos.indexOf(e.target as HTMLVideoElement);
      const v = videos[vi];
      if (vi !== index || !v) return;
      if (paused()) { v.currentTime = 0; void v.play().catch(() => {}); } // loop while held
      else goTo(index + 1);
    };
    const shouldHandOver = (t: number) => {
      if (!videos[index]) return t - idleAt > STILL_MS;
      return blocked ? t - idleAt > BLOCKED_MS : t - Math.max(idleAt, progressAt) > STALL_MS;
    };

    const setIndex = (i: number) => {
      index = ((i % n) + n) % n;
      count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
      title.textContent = CASES[index].title;
      cards.forEach((c, ci) => c.setAttribute("aria-current", ci === index ? "true" : "false"));
      syncVideos();
    };
    const goTo = (i: number) => {
      if (!ready) return;
      setIndex(i);
      target = pos + wrap(index - pos); // shortest way round
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
      if (paused()) idleAt = t;
      else if (shouldHandOver(t)) goTo(index + 1);
      render(pos, t);
      // Without autoplay (reduced motion) stop once everything has settled.
      const settled =
        reduced && !dragging && Math.abs(target - pos) < 1e-4 && Math.abs(vel) < 1e-4;
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
      if (!dragging) return;
      const now = performance.now(), dx = e.clientX - px;
      moved += Math.abs(dx);
      // capture only once it is a real drag: capturing on pointerdown would steal the card's click
      if (moved > 6 && !stage.hasPointerCapture(e.pointerId)) stage.setPointerCapture(e.pointerId);
      const d = (-dx / W) * DRAG_GAIN;
      pos += d;
      target = pos;
      pv = 0.8 * (d / Math.max(1, now - pt)) * 1000 + 0.2 * pv;
      px = e.clientX; pt = now;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      vel = pv;
      goTo(Math.round(pos + pv * 0.22));
    };
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
    stage.addEventListener("click", onClick, true);
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("keydown", onKey);
    stage.addEventListener("focusin", onFocus);
    stage.addEventListener("focusout", onBlur);

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      idleAt = performance.now();
      syncVideos();
      kick();
    });
    io.observe(stage);
    const onVis = () => { idleAt = performance.now(); syncVideos(); kick(); };
    videos.forEach((v) => {
      v?.addEventListener("ended", onEnded);
      v?.addEventListener("timeupdate", onProgress);
    });
    document.addEventListener("visibilitychange", onVis);
    const onCut = () => { applyCuts(); syncVideos(); };
    portraitMq.addEventListener("change", onCut);

    let resizeT = 0;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        if (!ready) return;
        build();
        render(pos, performance.now());
        syncVideos();
        kick();
      }, 60);
    };
    window.addEventListener("resize", onResize);

    build();
    ready = true;
    setIndex(0);
    render(pos, performance.now());
    stage.classList.add("is-ready");
    kick();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      portraitMq.removeEventListener("change", onCut);
      videos.forEach((v) => {
        v?.removeEventListener("ended", onEnded);
        v?.removeEventListener("timeupdate", onProgress);
        v?.pause();
      });
      window.removeEventListener("resize", onResize);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("click", onClick, true);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("keydown", onKey);
      stage.removeEventListener("focusin", onFocus);
      stage.removeEventListener("focusout", onBlur);
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
            <a key={c.title} className="case-drum-card" href={c.href} draggable={false} data-cursor="OPEN">
              {"video" in c ? (
                <video
                  {...videoSize(c.video)}
                  poster={assetUrl(c.poster)}
                  muted
                  playsInline
                  preload="none"
                  aria-hidden="true"
                  draggable={false}
                >
                  {videoSources(c.video).map((v) => (
                    <source key={v.src} src={v.src} type={v.type} />
                  ))}
                </video>
              ) : (
                <LiveCover fallback={c.gradient.fallback} mark={c.gradient.mark} alt="" />
              )}
              <span className="visually-hidden">{c.title}</span>
            </a>
          ))}
        </div>
      </div>
      <span className="case-drum-count" ref={countRef} aria-hidden="true">
        {`01 / ${String(CASES.length).padStart(2, "0")}`}
      </span>
      <span className="case-drum-title" ref={titleRef} aria-hidden="true">
        {CASES[0].title}
      </span>
    </div>
  );
}
