import { getProfile } from "./data/portfolio";
import { useT } from "./i18n/context";
import { ConsentSettingsButton } from "./components/ConsentBanner";

export default function Contact() {
  const profile = getProfile();
  const t = useT();

  return (
    <section className="section contact" id="contact">
      <div className="grid-shell contact-grid">
        <h2>{t("contact.heading")}</h2>
        <div className="contact-methods">
          <a href={`mailto:${profile.email}`} data-cursor="SAY HI" data-analytics="contact-email">
            {t("contact.email")}<span>{profile.email}</span>
          </a>
          <a href={profile.linkedin} data-cursor="OPEN" data-analytics="contact-linkedin">
            {t("contact.linkedin")}<span>{profile.linkedinLabel}</span>
          </a>
        </div>
        <div className="contact-year">
          <ConsentSettingsButton className="contact-privacy" />
          <span>© {profile.year}</span>
        </div>
      </div>
    </section>
  );
}
