import { profile } from "../data/portfolio";
import { assetUrl } from "../lib/url";

export default function Header() {
  const [firstName, lastName] = profile.name.split(" ");

  return (
    <header className="site-header">
      <nav className="nav grid-shell" aria-label="Primary navigation">
        <a className="brand" href="#top">
          {firstName}
          <br className="mobile-break" /> {lastName}
        </a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#about">About</a>
        </div>
        <div className="nav-actions">
          <a className="contact-link" href="#contact">
            <span className="desktop-only">Contact</span>
            <span className="mobile-only">@</span>
          </a>
          <a
            className="cv-link"
            href={assetUrl("cv.pdf")}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            CV ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
