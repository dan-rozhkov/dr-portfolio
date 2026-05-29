import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) {
      return undefined;
    }

    const cursor = cursorRef.current;
    const labelEl = labelRef.current;
    if (!cursor || !labelEl) return undefined;
    const SAFE_ZONE = 24;
    let currentLabel = "";
    let magnetTarget: HTMLElement | null = null;

    const onMove = (event: PointerEvent) => {
      const startTarget = event.target as Element | null;
      let target: HTMLElement | null =
        (startTarget?.closest?.("a, button, [data-cursor]") as HTMLElement | null) ?? null;
      const directHit = target;

      if (!target) {
        const candidates = document.querySelectorAll<HTMLElement>(
          "a, button, [data-cursor]"
        );
        let best: HTMLElement | null = null;
        let bestDist = SAFE_ZONE;
        for (const el of candidates) {
          const rect = el.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
          const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
          const dist = Math.hypot(dx, dy);
          if (dist < bestDist) {
            bestDist = dist;
            best = el;
          }
        }
        target = best;
      }

      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.classList.add("is-visible");
      cursor.classList.toggle("is-active", Boolean(target));
      cursor.classList.toggle(
        "is-compact",
        Boolean(target?.closest(".extra-tab, .site-header a")),
      );

      magnetTarget = target && !directHit ? target : null;

      const nextLabel = target?.dataset.cursor || "";
      cursor.classList.toggle("has-label", Boolean(nextLabel));
      if (nextLabel !== currentLabel) {
        currentLabel = nextLabel;
        labelEl.textContent = nextLabel;
      }
    };

    const onLeave = () => {
      cursor.classList.remove("is-visible", "is-active", "has-label", "is-compact");
      magnetTarget = null;
    };

    const onClick = (event: MouseEvent) => {
      if (!magnetTarget) return;
      const clickTarget = event.target as Element | null;
      if (clickTarget?.closest?.("a, button, [data-cursor]")) return;
      event.preventDefault();
      event.stopPropagation();
      magnetTarget.click();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <div ref={cursorRef} className="cursor" aria-hidden="true">
      <span ref={labelRef} />
    </div>
  );
}
