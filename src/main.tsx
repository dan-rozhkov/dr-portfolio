import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "../styles.css";

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
