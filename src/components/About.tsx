import { getAbout, getProfile } from "../data/portfolio";
import { assetUrl } from "../lib/url";
import { withLogos } from "./withLogos";

export default function About() {
  const about = getAbout();
  const profile = getProfile();
  return (
    <section className="section about snap-section" id="about">
      <div className="grid-shell about-grid">
        <img
          className="portrait"
          // portrait.png (800px) stays as the og:image fallback in entry-server.tsx; replace both together
          src={assetUrl("portrait.webp")}
          alt={`Portrait of ${profile.name}`}
          width={560}
          height={560}
          loading="lazy"
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
