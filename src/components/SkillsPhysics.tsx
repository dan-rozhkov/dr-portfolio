import { useEffect, useRef } from "react";
import { getSkills } from "../data/portfolio";
import { useT } from "../i18n/context";

interface Chip {
  el: HTMLElement;
  w: number;
  h: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  va: number; // angular velocity
  r: number; // bounding radius (for broad-phase collision)
}

// A small, dependency-free 2D physics field that mimics Tilda's
// "lay-drag-physics" zero block: word chips drift around, bounce off the
// walls and each other, can be flung with the cursor, and get nudged on hover.
// Tuned to feel like the reference (chepurnov.com): gravity off, light air
// drag, springy collisions, throw-on-release, gentle rotation.
const CONFIG = {
  speed: 0.45, // initial drift speed
  frictionAir: 1.0, // velocity retained per frame (1 = no drag)
  restitution: 0.6, // wall/chip bounce energy
  throwStrength: 0.1, // how much pointer velocity transfers on release
  hoverImpulse: 0.3, // nudge when the cursor brushes a resting chip
  rotation: 0.015, // base spin amount
  maxSpeed: 12,
};

export default function SkillsPhysics() {
  const t = useT();
  const skills = getSkills();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return undefined;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const chips: Chip[] = Array.from(
      layer.querySelectorAll<HTMLElement>(".skill-chip"),
    ).map((el) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      return {
        el,
        w,
        h,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        angle: (Math.random() - 0.5) * 14,
        va: (Math.random() - 0.5) * CONFIG.rotation * 60,
        r: Math.hypot(w, h) / 2,
      };
    });

    let bounds = stage.getBoundingClientRect();

    const place = () => {
      bounds = stage.getBoundingClientRect();
      chips.forEach((c) => {
        c.x = Math.random() * Math.max(1, bounds.width - c.w);
        c.y = Math.random() * Math.max(1, bounds.height - c.h);
        const a = Math.random() * Math.PI * 2;
        const s = CONFIG.speed * (0.3 + Math.random() * 1.4);
        c.vx = Math.cos(a) * s;
        c.vy = Math.sin(a) * s;
        c.va = (Math.random() - 0.5) * CONFIG.rotation * 120;
      });
    };
    place();

    if (reduced) {
      // Static, readable layout for reduced-motion users.
      chips.forEach((c) => {
        c.el.style.transform = `translate(${c.x}px, ${c.y}px) rotate(${c.angle}deg)`;
      });
      return undefined;
    }

    // ---- Pointer dragging / throwing ----
    let dragged: Chip | null = null;
    let pointerId: number | null = null;
    let lastPx = 0;
    let lastPy = 0;
    let pVx = 0;
    let pVy = 0;
    let grabDx = 0;
    let grabDy = 0;

    const localPoint = (e: PointerEvent) => {
      const b = stage.getBoundingClientRect();
      return { px: e.clientX - b.left, py: e.clientY - b.top };
    };

    const onPointerDown = (e: PointerEvent) => {
      const { px, py } = localPoint(e);
      // topmost chip under the pointer
      for (let i = chips.length - 1; i >= 0; i--) {
        const c = chips[i];
        if (px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h) {
          dragged = c;
          pointerId = e.pointerId;
          grabDx = px - c.x;
          grabDy = py - c.y;
          lastPx = px;
          lastPy = py;
          pVx = 0;
          pVy = 0;
          c.vx = 0;
          c.vy = 0;
          c.el.classList.add("is-grabbed");
          stage.setPointerCapture(e.pointerId);
          e.preventDefault();
          break;
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const { px, py } = localPoint(e);
      if (dragged && e.pointerId === pointerId) {
        const nx = px - grabDx;
        const ny = py - grabDy;
        pVx = px - lastPx;
        pVy = py - lastPy;
        lastPx = px;
        lastPy = py;
        dragged.x = nx;
        dragged.y = ny;
        return;
      }
      // hover nudge on resting chips
      for (const c of chips) {
        const cx = c.x + c.w / 2;
        const cy = c.y + c.h / 2;
        const dx = cx - px;
        const dy = cy - py;
        const d = Math.hypot(dx, dy);
        if (d < c.r) {
          const f = (CONFIG.hoverImpulse * (c.r - d)) / c.r;
          c.vx += (dx / (d || 1)) * f;
          c.vy += (dy / (d || 1)) * f;
          c.va += (Math.random() - 0.5) * CONFIG.rotation * 40;
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (dragged && e.pointerId === pointerId) {
        dragged.vx = pVx * CONFIG.throwStrength * 6;
        dragged.vy = pVy * CONFIG.throwStrength * 6;
        dragged.va = pVx * CONFIG.rotation * 2;
        dragged.el.classList.remove("is-grabbed");
        dragged = null;
        pointerId = null;
      }
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);

    // ---- Collision resolution between two chips (circle approx) ----
    const collide = (a: Chip, b: Chip) => {
      const ax = a.x + a.w / 2;
      const ay = a.y + a.h / 2;
      const bx = b.x + b.w / 2;
      const by = b.y + b.h / 2;
      const dx = bx - ax;
      const dy = by - ay;
      const dist = Math.hypot(dx, dy) || 0.001;
      const min = (a.r + b.r) * 0.7;
      if (dist < min) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (min - dist) / 2;
        if (a !== dragged) {
          a.x -= nx * overlap;
          a.y -= ny * overlap;
        }
        if (b !== dragged) {
          b.x += nx * overlap;
          b.y += ny * overlap;
        }
        // exchange velocity along the collision normal
        const rvx = b.vx - a.vx;
        const rvy = b.vy - a.vy;
        const sep = rvx * nx + rvy * ny;
        if (sep < 0) {
          const imp = -(1 + CONFIG.restitution) * sep * 0.5;
          if (a !== dragged) {
            a.vx -= imp * nx;
            a.vy -= imp * ny;
          }
          if (b !== dragged) {
            b.vx += imp * nx;
            b.vy += imp * ny;
          }
          a.va += (Math.random() - 0.5) * CONFIG.rotation * 30;
          b.va += (Math.random() - 0.5) * CONFIG.rotation * 30;
        }
      }
    };

    let raf = 0;
    const clamp = (v: number) =>
      Math.max(-CONFIG.maxSpeed, Math.min(CONFIG.maxSpeed, v));

    const step = () => {
      const W = bounds.width;
      const H = bounds.height;

      for (const c of chips) {
        if (c === dragged) continue;
        c.vx *= CONFIG.frictionAir;
        c.vy *= CONFIG.frictionAir;
        c.vx = clamp(c.vx);
        c.vy = clamp(c.vy);
        c.x += c.vx;
        c.y += c.vy;
        c.angle += c.va;

        // walls
        if (c.x < 0) {
          c.x = 0;
          c.vx = Math.abs(c.vx) * CONFIG.restitution;
          c.va += c.vy * 0.02;
        } else if (c.x + c.w > W) {
          c.x = W - c.w;
          c.vx = -Math.abs(c.vx) * CONFIG.restitution;
          c.va -= c.vy * 0.02;
        }
        if (c.y < 0) {
          c.y = 0;
          c.vy = Math.abs(c.vy) * CONFIG.restitution;
        } else if (c.y + c.h > H) {
          c.y = H - c.h;
          c.vy = -Math.abs(c.vy) * CONFIG.restitution;
        }
      }

      // pairwise collisions
      for (let i = 0; i < chips.length; i++) {
        for (let j = i + 1; j < chips.length; j++) {
          collide(chips[i], chips[j]);
        }
      }

      // keep dragged chip in-bounds too
      if (dragged) {
        dragged.x = Math.max(0, Math.min(W - dragged.w, dragged.x));
        dragged.y = Math.max(0, Math.min(H - dragged.h, dragged.y));
      }

      for (const c of chips) {
        c.el.style.transform = `translate(${c.x}px, ${c.y}px) rotate(${c.angle}deg)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const onResize = () => {
      const prev = bounds;
      bounds = stage.getBoundingClientRect();
      const sx = bounds.width / (prev.width || 1);
      const sy = bounds.height / (prev.height || 1);
      chips.forEach((c) => {
        c.x = Math.min(c.x * sx, bounds.width - c.w);
        c.y = Math.min(c.y * sy, bounds.height - c.h);
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointercancel", onPointerUp);
    };
  }, [skills]);

  return (
    <section className="section skills-physics snap-section" id="skills">
      <div className="grid-shell skills-grid">
        <h2 className="skills-heading">{t("skills.heading")}</h2>
        <div className="skills-stage" ref={stageRef} aria-hidden="true">
          <div className="skills-layer" ref={layerRef}>
            {skills.map((label) => (
              <span className="skill-chip" key={label}>
                {label}
              </span>
            ))}
          </div>
        </div>
        <ul className="skills-fallback">
          {skills.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
