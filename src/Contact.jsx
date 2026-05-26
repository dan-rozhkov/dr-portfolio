import { profile } from "./data/portfolio.js";

export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="grid-shell contact-grid">
        <h2>Think of all the useful things we could build together</h2>
        <div className="contact-methods">
          <a href={`mailto:${profile.email}`} data-cursor="SAY HI">
            Get in touch ↗<span>{profile.email}</span>
          </a>
          <a href={profile.linkedin} data-cursor="OPEN">
            LinkedIn ↗<span>{profile.linkedinLabel}</span>
          </a>
        </div>
        <span className="contact-year">© {profile.year}</span>
      </div>
    </section>
  );
}
