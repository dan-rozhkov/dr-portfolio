import { getProfile } from "./data/portfolio";
import { useT } from "./i18n/context";

export default function Contact() {
  const profile = getProfile();
  const t = useT();

  return (
    <section className="section contact" id="contact">
      <div className="grid-shell contact-grid">
        <h2>{t("contact.heading")}</h2>
        <div className="contact-methods">
          <a href={`mailto:${profile.email}`} data-cursor="SAY HI">
            {t("contact.email")}<span>{profile.email}</span>
          </a>
          <a href={profile.linkedin} data-cursor="OPEN">
            {t("contact.linkedin")}<span>{profile.linkedinLabel}</span>
          </a>
        </div>
        <span className="contact-year">© {profile.year}</span>
      </div>
    </section>
  );
}
