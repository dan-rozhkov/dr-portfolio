import { getRecognition } from "../data/portfolio";
import { useLang } from "../i18n/context";

export default function Recognition() {
  const recognition = getRecognition();
  const lang = useLang();

  return (
    <section className="section recognition snap-section">
      {recognition.map((group) => (
        <div className="grid-shell list-section" key={group.title}>
          <h2>{group.title}</h2>
          <ul className="recognition-grid">
            {group.items.map(([title, detail, href]) => {
              const resolvedHref = href.startsWith("/case/")
                ? `/${lang}${href}`
                : href;
              return (
                <li key={title}>
                  <a href={resolvedHref}>
                    {title}
                    <span>{detail}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
