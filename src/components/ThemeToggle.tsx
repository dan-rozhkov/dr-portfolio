import { useSyncExternalStore } from "react";
import { useT } from "../i18n/context";

type Theme = "light" | "dark";

const EVENT = "themechange";
const readTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

// Light is always the default; dark is kept only after the visitor picks it.
// index.html applies the saved choice before first paint.
export default function ThemeToggle() {
  const t = useT();
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      if (next === "dark") localStorage.setItem("theme", "dark");
      else localStorage.removeItem("theme");
    } catch {
      // Storage blocked: the choice lasts for this page only.
    }
    window.dispatchEvent(new Event(EVENT));
  };

  const label = theme === "dark" ? t("nav.themeLight") : t("nav.themeDark");

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}
