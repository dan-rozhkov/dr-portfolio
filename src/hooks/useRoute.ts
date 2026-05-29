import { useEffect, useState } from "react";
import { BASE, BASE_NO_SLASH } from "../lib/url";

export type Route = { name: "home" } | { name: "case"; id: string };

export function parseRoute(pathname: string): Route {
  const rel = (pathname || "/").replace(BASE_NO_SLASH, "") || "/";
  const m = rel.match(/^\/case\/([\w-]+)\/?$/);
  return m ? { name: "case", id: m[1] } : { name: "home" };
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
        if (window.location.pathname.replace(/\/$/, "") !== BASE_NO_SLASH) {
          event.preventDefault();
          window.history.pushState({}, "", BASE + href);
          setRoute(parseRoute(BASE));
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
