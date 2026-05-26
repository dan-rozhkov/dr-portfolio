import { useEffect, useRef, useState } from "react";
import {
  about,
  cases,
  extraWork,
  hero,
  profile,
  recognition,
} from "./data/portfolio.js";

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
        <a className="contact-link" href="#contact">
          <span className="desktop-only">Contact</span>
          <span className="mobile-only">@</span>
        </a>
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
    let currentLabel = "VIEW";

    const onMove = (event) => {
      const target = event.target.closest?.("[data-cursor]");
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.classList.add("is-visible");
      cursor.classList.toggle("is-active", Boolean(target));
      const nextLabel = target?.dataset.cursor || "VIEW";
      if (nextLabel !== currentLabel) {
        currentLabel = nextLabel;
        labelEl.textContent = nextLabel;
      }
    };

    const onLeave = () => {
      cursor.classList.remove("is-visible", "is-active");
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
      <span ref={labelRef}>VIEW</span>
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
          <span>©{profile.year}</span>
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
          className={`case-media media-${item.visual}`}
          href={`#${item.id}`}
          data-cursor="VIEW"
          aria-label={`View ${item.title} case study`}
        >
          <CaseVisual type={item.visual} />
        </a>
      </article>
    </section>
  );
}

function CaseVisual({ type }) {
  if (type === "finance") {
    return <FinanceVisual />;
  }

  if (type === "index") {
    return <IndexVisual />;
  }

  return <AiVisual />;
}

function AiVisual() {
  return (
    <div className="desktop-composition ai-composition" aria-hidden="true">
      <div className="phone phone-large">
        <div className="phone-top" />
        <div className="task-stack">
          <span />
          <span />
          <span />
        </div>
        <div className="metric">84%</div>
        <div className="screen-card" />
      </div>
      <div className="phone phone-large muted-phone">
        <div className="orbital" />
        <div className="timeline">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="phone phone-large">
        <div className="chat-row strong" />
        <div className="chat-row" />
        <div className="chat-row short" />
        <div className="keypad">
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FinanceVisual() {
  return (
    <div className="desktop-composition dashboard-composition" aria-hidden="true">
      <div className="dashboard-window">
        <div className="dashboard-sidebar">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="dashboard-main">
          <div className="chart-card">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="data-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
      </div>
      <div className="floating-panel">
        <b>Transfer</b>
        <strong>$48,200</strong>
        <span />
      </div>
    </div>
  );
}

function IndexVisual() {
  return (
    <div className="desktop-composition search-composition" aria-hidden="true">
      <div className="search-window">
        <div className="search-brand">Index</div>
        <div className="search-bar" />
        <div className="signal-row">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function ExtraWork() {
  const [activeTab, setActiveTab] = useState(extraWork.tabs[0]);

  return (
    <section className="section extra-work snap-section">
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
          className="large-preview"
          href="#systems"
          data-cursor="PLAY"
          aria-label="Open interaction systems preview"
        >
          <div className="preview-stage" aria-hidden="true">
            <div className="preview-topbar">
              <span />
              <span />
              <span />
            </div>
            <div className="preview-grid">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} />
              ))}
            </div>
            <div className="command-panel">
              <span />
              <span />
              <span />
            </div>
          </div>
        </a>
      </article>
    </section>
  );
}

function About() {
  return (
    <section className="section about snap-section" id="about">
      <div className="grid-shell about-grid">
        <div className="portrait" aria-label="Portrait placeholder">
          <div className="portrait-head" />
          <div className="portrait-body" />
        </div>
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

function Contact() {
  return (
    <section className="section contact snap-section" id="contact">
      <div className="grid-shell contact-grid">
        <h2>
          Think of all the useful things
          <br />
          we could build together
        </h2>
        <div className="contact-methods">
          <a href={`mailto:${profile.email}`} data-cursor="SAY HI">
            Get in touch ↗<span>{profile.email}</span>
          </a>
          <a href={profile.github} data-cursor="OPEN">
            GitHub ↗<span>{profile.githubLabel}</span>
          </a>
        </div>
        <span className="contact-year">©{profile.year}</span>
      </div>
    </section>
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

export default function App() {
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
      <ContactObserver />
    </>
  );
}
