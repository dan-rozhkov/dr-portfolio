import type { ReactNode } from "react";
import { getAbout, getProfile } from "../data/portfolio";
import { assetUrl } from "../lib/url";

// Company names that get their mark inline, right before the name.
const LOGOS: { name: string; src: string; shape: "round" | "square" }[] = [
  { name: "JetBrains", src: "jetbrains-logo.svg", shape: "square" },
  { name: "Sber", src: "sber-logo.avif", shape: "round" },
];

function withLogos(paragraph: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = paragraph;
  for (;;) {
    let next: { idx: number; logo: (typeof LOGOS)[number] } | null = null;
    for (const logo of LOGOS) {
      const idx = rest.indexOf(logo.name);
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

export default function About() {
  const about = getAbout();
  const profile = getProfile();
  return (
    <section className="section about snap-section" id="about">
      <div className="grid-shell about-grid">
        <img
          className="portrait"
          src={assetUrl("portrait.png")}
          alt={`Portrait of ${profile.name}`}
        />
        <div className="about-text">
          {about.map((paragraph) => (
            <p key={paragraph}>{withLogos(paragraph)}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
