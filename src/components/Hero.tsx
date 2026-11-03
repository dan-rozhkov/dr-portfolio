import { getHero, getProfile } from "../data/portfolio";
import { withLogos } from "./withLogos";

export default function Hero() {
  const hero = getHero();
  const profile = getProfile();
  return (
    <section className="section hero snap-section" id="top">
      <div className="grid-shell hero-grid">
        <h1>{withLogos(hero.text)}</h1>
        <div className="hero-meta">
          <span>{profile.location}</span>
          <span>© {profile.year}</span>
        </div>
      </div>
    </section>
  );
}
