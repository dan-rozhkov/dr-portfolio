import { getHero, getProfile } from "../data/portfolio";

export default function Hero() {
  const hero = getHero();
  const profile = getProfile();
  return (
    <section className="section hero snap-section" id="top">
      <div className="grid-shell hero-grid">
        <h1>
          {hero.lines.map((line, index) => (
            <span key={line}>
              {line}
              {index < hero.lines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <div className="hero-meta">
          <span>{profile.location}</span>
          <span>© {profile.year}</span>
        </div>
      </div>
    </section>
  );
}
