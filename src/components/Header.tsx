import { getProfile } from "../data/portfolio";
import { assetUrl } from "../lib/url";
import { casesLink, jobsLink } from "../lib/writingUrl";
import { useT } from "../i18n/context";

export default function Header() {
  const profile = getProfile();
  const t = useT();
  const [firstName, lastName] = profile.name.split(" ");

  return (
    <header className="site-header">
      <nav className="nav grid-shell" aria-label={t("nav.ariaLabel")}>
        <a className="brand" href="#top">
          {firstName}
          <br className="mobile-break" /> {lastName}
        </a>
        <div className="nav-links">
          <a className="desktop-only" href="#work">{t("nav.work")}</a>
          <a className="desktop-only" href="#about">{t("nav.about")}</a>
          <a href={casesLink()}>{t("nav.writing")}</a>
          <a href={jobsLink()}>{t("nav.jobs")}</a>
        </div>
        <div className="nav-actions">
          <a className="contact-link" href="#contact">
            <span className="desktop-only">{t("nav.contact")}</span>
            <span className="mobile-only">{t("nav.contactMobile")}</span>
          </a>
          <a
            className="cv-link"
            data-analytics="resume"
            href={assetUrl("cv.pdf")}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            {t("nav.cv")}
          </a>
        </div>
      </nav>
    </header>
  );
}
