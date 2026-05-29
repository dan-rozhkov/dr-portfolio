import { useEffect } from "react";

export function useContactObserver() {
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
}
