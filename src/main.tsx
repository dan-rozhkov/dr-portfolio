import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/components/header.css";
import "./styles/components/cursor.css";
import "./styles/components/hero.css";
import "./styles/components/case-section.css";
import "./styles/components/extra-work.css";
import "./styles/components/about.css";
import "./styles/components/recognition.css";
import "./styles/components/contact.css";
import "./styles/components/case-indicator.css";
import "./styles/components/case-study.css";

if (import.meta.env.DEV) {
  import("live-studio").then(({ startStudio }) => startStudio());
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

const tree = (
  <StrictMode>
    <App initialPath={window.location.pathname} />
  </StrictMode>
);

if (container.firstElementChild) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
