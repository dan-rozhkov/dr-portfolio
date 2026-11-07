import { useEffect } from "react";

/** Fade the hero meta out and the contact year in as the page scrolls. */
export function useScrollFade() {
  useEffect(() => {
    const contactSection = document.querySelector<HTMLElement>("#contact");

    if (!contactSection) {
      return undefined;
    }

    const update = () => {
      const vh = window.innerHeight;
      const scrollTop = window.scrollY;
      const heroOpacity = Math.max(0, Math.min(1, 1 - scrollTop / (vh * 0.6)));

      const contactTop = contactSection.getBoundingClientRect().top + scrollTop;
      const distance = contactTop - scrollTop;
      const contactOpacity = Math.max(
        0,
        Math.min(1, 1 - distance / (vh * 0.6))
      );

      document.body.style.setProperty("--hero-meta-opacity", String(heroOpacity));
      document.body.style.setProperty("--contact-year-opacity", String(contactOpacity));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}
