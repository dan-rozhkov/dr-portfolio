import { useEffect, useRef } from "react";

/*
 * Qure's cover: a dithered swirl turning around the centre. The swirl field and the 8x8
 * Bayer matrix come from Paper Shaders' Dithering shader (github.com/paper-design/shaders,
 * Apache-2.0, shape "swirl"); the colour gradient on the pixels is ours. Drawn with
 * canvas 2D, so it runs everywhere; it pauses off screen and draws one still frame under
 * reduced motion.
 */

const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60,
  28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15,
  47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

/** Pixel colour stops, swept diagonally across the frame: blue → cyan → pale → amber → orange. */
const STOPS: [number, [number, number, number]][] = [
  [0, [41, 69, 255]],
  [0.28, [61, 199, 255]],
  [0.5, [219, 242, 255]],
  [0.7, [255, 199, 97]],
  [1, [255, 107, 41]],
];

const BACKGROUND = "#0E1014";
const COLUMNS = 100; // grid columns across the cover
const PIXEL = 0.58; // pixel size as a share of a grid cell
const START = 1; // shader time of the first (and reduced-motion) frame
const SPEED = 0.5; // shader time per second; one full turn of the pattern takes π / SPEED ≈ 6.3 s
// Swirl tuned to one arm with dark gaps between its turns
const TWIST = 1.2;
const PULL = 0.6;
const FADE = 0.55;
const SHARPNESS = 1.8;

const smooth = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function swirl(u: number, v: number, t: number): number {
  const l = Math.hypot(u, v);
  const angle = Math.atan2(v, u) + 4 * t;
  const offset = PULL / Math.pow(Math.max(l, 1e-6), TWIST) + angle / (Math.PI * 2);
  return smooth(0, FADE, Math.pow(l, TWIST)) * Math.pow(offset - Math.floor(offset), SHARPNESS);
}

function gradient(k: number): string {
  const x = Math.max(0, Math.min(1, k));
  for (let i = 1; i < STOPS.length; i++) {
    const [b, cb] = STOPS[i];
    if (x <= b) {
      const [a, ca] = STOPS[i - 1];
      const f = (x - a) / (b - a);
      return `rgb(${ca.map((c, j) => Math.round(c + (cb[j] - c) * f)).join(",")})`;
    }
  }
  return `rgb(${STOPS[STOPS.length - 1][1].join(",")})`;
}

function draw(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, width, height);
  const cell = width / COLUMNS;
  const size = Math.max(1, Math.round(cell * PIXEL));
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;
  const m = Math.min(width, height);
  const t = 0.5 * time;
  for (let j = -1; j < rows; j++) {
    for (let i = -1; i < cols; i++) {
      // Grid centred on the canvas, like the shader's pixelised UV
      const gx = i - Math.floor(cols / 2);
      const gy = j - Math.floor(rows / 2);
      const cx = width / 2 + (gx + 0.5) * cell;
      const cy = height / 2 + (gy + 0.5) * cell;
      const shape = swirl((cx - width / 2) / m, -(cy - height / 2) / m, t);
      const bx = ((gx % 8) + 8) % 8;
      const by = (((-gy - 1) % 8) + 8) % 8;
      if (shape + BAYER[by * 8 + bx] / 64 - 0.5 < 0.5) continue;
      const k = 0.5 + 0.42 * ((cx / width - 0.5) * 1.1 + (cy / height - 0.5) * 0.55) + 0.18 * (shape - 0.5);
      ctx.fillStyle = gradient(k);
      ctx.fillRect(Math.round(cx - size / 2), Math.round(cy - size / 2), size, size);
    }
  }
}

/** Animated swirl that fills its positioned parent. */
export function SwirlCover({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let inView = false;
    let disposed = false;
    const startedAt = performance.now();
    const now = () => START + ((performance.now() - startedAt) / 1000) * SPEED;

    function resize() {
      if (!canvas) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    }
    function paint(time: number) {
      if (!canvas || !ctx) return;
      draw(ctx, canvas.width, canvas.height, time);
      canvas.dataset.ready = "true";
    }
    function tick() {
      frame = 0;
      if (disposed || !inView || document.hidden) return;
      paint(now());
      frame = requestAnimationFrame(tick);
    }
    function schedule() {
      if (reduced) return;
      if (frame === 0 && inView && !document.hidden) frame = requestAnimationFrame(tick);
    }

    resize();
    paint(START);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            resize();
            paint(reduced ? START : now());
          });
    resizeObserver?.observe(canvas);
    const intersectionObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            schedule();
          });
    if (intersectionObserver) intersectionObserver.observe(canvas);
    else {
      inView = true;
      schedule();
    }
    const onVisibility = () => schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
