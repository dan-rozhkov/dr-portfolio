import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

export { getCases as cases } from "./data/portfolio";

export function render(path: string): string {
  return renderToString(
    <StrictMode>
      <App initialPath={path} />
    </StrictMode>
  );
}
