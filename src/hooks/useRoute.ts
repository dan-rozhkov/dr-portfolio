import { useEffect, useState } from "react";
import { BASE_NO_SLASH } from "../lib/url";
import type { Lang } from "../i18n/translations";

export type Route = { name: "home"; lang: Lang } | { name: "case"; id: string; lang: Lang };

export function extractLang(pathname: string): Lang {
  const rel = (pathname || "/").replace(BASE_NO_SLASH, "") || "/";
  const m = rel.match(/^\/(en|ru)(\/|$)/);
  return m ? (m[1] as Lang) : "en";
}

export function parseRoute(pathname: string): Route {
  const lang = extractLang(pathname);
  const rel = (pathname || "/").replace(BASE_NO_SLASH, "") || "/";
  // Strip language prefix for case matching
  const stripped = rel.replace(/^\/(en|ru)\//, "/").replace(/^\/(en|ru)$/, "/");
  const m = stripped.match(/^\/case\/([\w-]+)\/?$/);
  if (m) return { name: "case", id: m[1], lang };
  return { name: "home", lang };
}

export function useRoute(initialPath: string): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseRoute(initialPath));

  useEffect(() => {
    const onPop = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", onPop);

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target as Element | null;
      const link = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!link) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;
      const href = link.getAttribute("href");
      if (!href) return;

      if (href.startsWith("#")) {
        const currentPath = window.location.pathname.replace(/\/$/, "");
        const currentBase = BASE_NO_SLASH.replace(/\/$/, "");
        if (currentPath !== currentBase) {
          event.preventDefault();
          const lang = extractLang(window.location.pathname);
          const targetPath = `/${lang}${href}`;
          window.history.pushState({}, "", targetPath);
          setRoute(parseRoute(targetPath));
          requestAnimationFrame(() => {
            const id = href.slice(1);
            const el = id ? document.getElementById(id) : null;
            if (el) el.scrollIntoView();
          });
        }
        return;
      }

      const url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (!url.pathname.startsWith(BASE_NO_SLASH)) return;
      if (/\.[a-z0-9]+$/i.test(url.pathname)) return;

      event.preventDefault();
      window.history.pushState({}, "", url.pathname + url.search + url.hash);
      setRoute(parseRoute(url.pathname));
      window.scrollTo(0, 0);
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return [route, setRoute];
}
