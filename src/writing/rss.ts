export interface RssPost {
  slug: string;
  title: string;
  dek: string;
  /** YYYY-MM-DD */
  date: string;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRss(posts: RssPost[], origin: string): string {
  const base = origin.replace(/\/+$/, "");
  const items = posts
    .map((p) => {
      const link = `${base}/en/writing/${p.slug}/`;
      return [
        "    <item>",
        `      <title>${esc(p.title)}</title>`,
        `      <link>${esc(link)}</link>`,
        `      <guid>${esc(link)}</guid>`,
        `      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>`,
        `      <description>${esc(p.dek)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Danil Rozhkov — Writing</title>
    <link>${esc(`${base}/en/writing/`)}</link>
    <description>What I build and why. Long reads on design engineering, AI tooling and product decisions.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
}
