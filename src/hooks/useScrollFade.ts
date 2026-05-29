import { useEffect } from "react";

export function useScrollFade() {
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(".snap-container");
    const contactSection = document.querySelector<HTMLElement>("#contact");

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

      document.body.style.setProperty("--hero-meta-opacity", String(heroOpacity));
      document.body.style.setProperty("--contact-year-opacity", String(contactOpacity));
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}
