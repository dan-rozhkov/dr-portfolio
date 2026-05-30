import { useEffect, useState } from "react";
import { getCases, getExtraWork } from "../data/portfolio";

export default function CaseIndicator() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const cases = getCases();
  const extraWork = getExtraWork();

  const items = [
    ...cases.map((item) => ({ id: item.id, label: item.title })),
    { id: "also-shipped", label: extraWork.title },
  ];

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return undefined;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.intersectionRatio);
        }
        let bestId: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        setVisible(bestRatio > 0.35);
        if (bestId) setActiveId(bestId);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`case-indicator ${visible ? "is-visible" : ""}`}
      aria-label="Case study navigation"
      aria-hidden={!visible}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`case-indicator-dot ${
            activeId === item.id ? "is-active" : ""
          }`}
          aria-label={item.label}
          aria-current={activeId === item.id ? "true" : undefined}
        />
      ))}
    </nav>
  );
}
