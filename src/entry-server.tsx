import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { setDataLang } from "./data/portfolio";
import { extractLang, parseRoute } from "./hooks/useRoute";
import { getPageTitle } from "./lib/pageTitle";

export { getCases as cases } from "./data/portfolio";

export function render(path: string): string {
  setDataLang(extractLang(path));
  return renderToString(
    <StrictMode>
      <App initialPath={path} />
    </StrictMode>
  );
}

export function pageTitle(path: string): string {
  setDataLang(extractLang(path));
  return getPageTitle(parseRoute(path));
}
