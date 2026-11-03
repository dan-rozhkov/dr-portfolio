import type { ReactNode } from "react";
import { assetUrl } from "../lib/url";

// Company names that get their mark inline, right before the name.
const LOGOS: { name: string; src: string; shape: "round" | "square" }[] = [
  { name: "JetBrains", src: "jetbrains-logo.svg", shape: "square" },
  { name: "Sber", src: "sber-logo.avif", shape: "round" },
];

export function withLogos(paragraph: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = paragraph;
  for (;;) {
    let next: { idx: number; logo: (typeof LOGOS)[number] } | null = null;
    for (const logo of LOGOS) {
      // Whole words only: "Sber" must not match inside "Sberbank".
      const idx = rest.search(new RegExp(`\\b${logo.name}\\b`));
      if (idx !== -1 && (!next || idx < next.idx)) next = { idx, logo };
    }
    if (!next) break;
    out.push(rest.slice(0, next.idx));
    // Mark and name stay on one line
    out.push(
      <span key={out.length} className="inline-brand">
        <img
          className={`inline-logo inline-logo--${next.logo.shape}`}
          src={assetUrl(next.logo.src)}
          // Square marks: reserve the box so the hero text doesn't shift when they load.
          width={64}
          height={64}
          alt=""
          aria-hidden="true"
        />
        {next.logo.name}
      </span>,
    );
    rest = rest.slice(next.idx + next.logo.name.length);
  }
  out.push(rest);
  return out;
}
