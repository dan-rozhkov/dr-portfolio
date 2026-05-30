import { useState } from "react";
import { getExtraWork } from "../data/portfolio";
import { assetUrl } from "../lib/url";
import { useT } from "../i18n/context";

export default function ExtraWork() {
  const t = useT();
  const extraWork = getExtraWork();
  const [activeTab, setActiveTab] = useState(
    extraWork.tabs.find((tab) => extraWork.previews[tab]) ?? extraWork.tabs[0],
  );
  const [navDir, setNavDir] = useState<"NEXT" | "PREV">("NEXT");

  const cycle = (dir: "NEXT" | "PREV") => {
    const tabs = extraWork.tabs;
    const idx = tabs.indexOf(activeTab);
    const next = dir === "NEXT" ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[next]);
  };

  const onPreviewMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setNavDir(event.clientX - rect.left > rect.width / 2 ? "NEXT" : "PREV");
  };

  return (
    <section className="section extra-work snap-section" id="also-shipped">
      <article className="grid-shell extra-grid">
        <div className="extra-list">
          <h2>{extraWork.title}</h2>
          <p>{extraWork.description}</p>
          {extraWork.tabs.map((tab) => (
            <button
              className={`extra-tab ${activeTab === tab ? "is-active" : ""}`}
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`large-preview ${
            extraWork.previews[activeTab] ? "case-media-image" : "case-media-placeholder"
          }`}
          data-cursor={navDir === "NEXT" ? t("extra.next") : t("extra.prev")}
          aria-label={navDir === "NEXT" ? t("extra.nextProject") : t("extra.prevProject")}
          onPointerMove={onPreviewMove}
          onClick={() => cycle(navDir)}
        >
          {extraWork.previews[activeTab] && (
            <img
              src={assetUrl(extraWork.previews[activeTab].src)}
              alt={extraWork.previews[activeTab].alt}
              loading="lazy"
            />
          )}
        </button>
      </article>
    </section>
  );
}
