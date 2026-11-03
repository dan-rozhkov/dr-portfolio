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
