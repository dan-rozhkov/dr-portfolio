import pages from "./pages.json";

export type AggregateEvent = {
  event: "$pageview" | "case_viewed" | "case_end_reached" | "contact_clicked" | "resume_clicked";
  page: string;
  channel?: "email" | "linkedin";
};

/** Unknown paths are discarded, including personal information in path segments. */
export function knownPage(path: string): string | null {
  const normalized = path.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  return pages.includes(normalized) ? normalized : null;
}

/** Reject extra keys. Rebuild the object instead of forwarding caller properties. */
export function validateEvent(input: unknown): AggregateEvent | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some((key) => !["event", "page", "channel"].includes(key))) return null;
  if (typeof value.page !== "string" || knownPage(value.page) !== value.page) return null;
  const page = value.page;
  switch (value.event) {
    case "$pageview":
    case "resume_clicked":
      return value.channel === undefined ? { event: value.event, page } : null;
    case "case_viewed":
    case "case_end_reached":
      return page.includes("/case/") && value.channel === undefined
        ? { event: value.event, page }
        : null;
    case "contact_clicked":
      return value.channel === "email" || value.channel === "linkedin"
        ? { event: value.event, page, channel: value.channel }
        : null;
    default:
      return null;
  }
}
