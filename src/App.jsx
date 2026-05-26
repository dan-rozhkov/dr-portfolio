import { useEffect, useRef, useState } from "react";
import {
  about,
  cases,
  extraWork,
  getCaseStudy,
  hero,
  profile,
  recognition,
} from "./data/portfolio.js";
import CaseStudy from "./CaseStudy.jsx";
import Contact from "./Contact.jsx";

function parseRoute(hash) {
  const m = (hash || "").match(/^#\/case\/([\w-]+)/);
  return m ? { name: "case", id: m[1] } : { name: "home" };
}

function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return [route, setRoute];
}

function Header() {
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
            href={`${import.meta.env.BASE_URL}cv.pdf`}
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

function CustomCursor() {
  const cursorRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) {
      return undefined;
    }

    const cursor = cursorRef.current;
    const labelEl = labelRef.current;
    const SAFE_ZONE = 24;
    let currentLabel = "";

    const onMove = (event) => {
      let target = event.target.closest?.("a, button, [data-cursor]");

      if (!target) {
        const candidates = document.querySelectorAll("a, button, [data-cursor]");
        let best = null;
        let bestDist = SAFE_ZONE;
        for (const el of candidates) {
          const rect = el.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
          const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
          const dist = Math.hypot(dx, dy);
          if (dist < bestDist) {
            bestDist = dist;
            best = el;
          }
        }
        target = best;
      }

      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.classList.add("is-visible");
      cursor.classList.toggle("is-active", Boolean(target));

      const nextLabel = target?.dataset.cursor || "";
      cursor.classList.toggle("has-label", Boolean(nextLabel));
      if (nextLabel !== currentLabel) {
        currentLabel = nextLabel;
        labelEl.textContent = nextLabel;
      }
    };

    const onLeave = () => {
      cursor.classList.remove("is-visible", "is-active", "has-label");
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={cursorRef} className="cursor" aria-hidden="true">
      <span ref={labelRef} />
    </div>
  );
}

function Hero() {
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

function CaseSection({ item, first }) {
  return (
    <section className="section case snap-section" id={item.id}>
      {first && <span id="work" aria-hidden="true" />}
      <article className="grid-shell case-grid">
        <div className="case-copy">
          <h2>{item.title}</h2>
          {item.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <dl className="case-meta">
            {item.meta.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <a
          className={`case-media ${
            item.variant === "mobile"
              ? "case-media-mobile"
              : "case-media-placeholder"
          }`}
          href={`#/case/${item.id}`}
          data-cursor="VIEW"
          aria-label={`View ${item.title} case study`}
        >
          {item.variant === "mobile" && (
            <div className="mobile-stack" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}
        </a>

      </article>
    </section>
  );
}

function ExtraWork() {
  const [activeTab, setActiveTab] = useState(extraWork.tabs[0]);

  return (
    <section className="section extra-work snap-section" id="also-shipped">
      <article className="grid-shell extra-grid">
        <div className="extra-list">
          <h2>{extraWork.title}</h2>
          <p>{extraWork.description}</p>
          {extraWork.tabs.map((tab) => (
            <button
              className={`extra-tab ${activeTab === tab ? "is-active" : ""}`}
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <a
          className="large-preview case-media-placeholder"
          href="#systems"
          data-cursor="PLAY"
          aria-label="Open interaction systems preview"
        />
      </article>
    </section>
  );
}

function About() {
  return (
    <section className="section about snap-section" id="about">
      <div className="grid-shell about-grid">
        <img
          className="portrait"
          src={`${import.meta.env.BASE_URL}portrait.png`}
          alt={`Portrait of ${profile.name}`}
        />
        <div className="about-text">
          {about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Recognition() {
  return (
    <section className="section recognition snap-section">
      {recognition.map((group) => (
        <div className="grid-shell list-section" key={group.title}>
          <h2>{group.title}</h2>
          <ul className="recognition-grid">
            {group.items.map(([title, detail, href]) => (
              <li key={title}>
                <a href={href}>
                  {title}
                  <span>{detail}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function CaseIndicator() {
  const [activeId, setActiveId] = useState(null);
  const [visible, setVisible] = useState(false);

  const items = [
    ...cases.map((item) => ({ id: item.id, label: item.title })),
    { id: "also-shipped", label: extraWork.title },
  ];

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const visibility = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.intersectionRatio);
        }
        let bestId = null;
        let bestRatio = 0;
        for (const [id, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        setVisible(bestRatio > 0.35);
        if (bestId) setActiveId(bestId);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`case-indicator ${visible ? "is-visible" : ""}`}
      aria-label="Case study navigation"
      aria-hidden={!visible}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`case-indicator-dot ${
            activeId === item.id ? "is-active" : ""
          }`}
          aria-label={item.label}
          aria-current={activeId === item.id ? "true" : undefined}
        />
      ))}
    </nav>
  );
}

function ContactObserver() {
  useEffect(() => {
    const contactSection = document.querySelector("#contact");

    if (!contactSection) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle("contact-active", entry.isIntersecting);
      },
      { threshold: 0.45 }
    );

    observer.observe(contactSection);

    return () => {
      observer.disconnect();
      document.body.classList.remove("contact-active");
    };
  }, []);

  return null;
}

function ScrollFade() {
  useEffect(() => {
    const scroller = document.querySelector(".snap-container");
    const contactSection = document.querySelector("#contact");

    if (!scroller || !contactSection) {
      return undefined;
    }

    const update = () => {
      const vh = scroller.clientHeight || window.innerHeight;
      const scrollTop = scroller.scrollTop;
      const heroOpacity = Math.max(0, Math.min(1, 1 - scrollTop / (vh * 0.6)));

      const contactTop = contactSection.offsetTop;
      const distance = contactTop - scrollTop;
      const contactOpacity = Math.max(
        0,
        Math.min(1, 1 - distance / (vh * 0.6))
      );

      document.body.style.setProperty("--hero-meta-opacity", heroOpacity);
      document.body.style.setProperty("--contact-year-opacity", contactOpacity);
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return null;
}

export default function App() {
  const [route] = useRoute();

  if (route.name === "case") {
    const study = getCaseStudy(route.id);
    if (study) {
      return (
        <>
          <CustomCursor />
          <Header />
          <CaseStudy study={study} />
        </>
      );
    }
  }

  return (
    <>
      <CustomCursor />
      <Header />
      <main className="snap-container">
        <Hero />
        {cases.map((item, index) => (
          <CaseSection item={item} first={index === 0} key={item.id} />
        ))}
        <ExtraWork />
        <About />
        <Recognition />
        <Contact />
      </main>
      <CaseIndicator />
      <ContactObserver />
      <ScrollFade />
    </>
  );
}
