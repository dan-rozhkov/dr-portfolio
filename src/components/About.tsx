import { getAbout, getProfile } from "../data/portfolio";
import { assetUrl } from "../lib/url";

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
          {about.map((paragraph) => {
            const idx = paragraph.indexOf("Sber");
            if (idx === -1) return <p key={paragraph}>{paragraph}</p>;
            return (
              <p key={paragraph}>
                {paragraph.slice(0, idx)}
                <img
                  className="inline-logo"
                  src={assetUrl("sber-logo.avif")}
                  alt=""
                  aria-hidden="true"
                />
                {paragraph.slice(idx)}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}
