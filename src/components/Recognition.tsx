import { recognition } from "../data/portfolio";
import { BASE_NO_SLASH } from "../lib/url";

export default function Recognition() {
  return (
    <section className="section recognition snap-section">
      {recognition.map((group) => (
        <div className="grid-shell list-section" key={group.title}>
          <h2>{group.title}</h2>
          <ul className="recognition-grid">
            {group.items.map(([title, detail, href]) => {
              const resolvedHref = href.startsWith("/case/")
                ? `${BASE_NO_SLASH}${href}`
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
