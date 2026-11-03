const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** A post date as shown on the site: month and year only ("Nov 2026"). */
export function formatMonthYear(iso: string): string {
  return MONTH_YEAR.format(new Date(`${iso}T00:00:00Z`));
}
