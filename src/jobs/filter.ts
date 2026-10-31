import type { Job, JobFamily } from "./types";

const DAY = 24 * 60 * 60 * 1000;
// Same window as the "new this week" stat.
const NEW_WINDOW = 7 * DAY;

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function filterJobs(
  jobs: Job[],
  f: { family: JobFamily | null; mode: Job["mode"] },
): Job[] {
  return jobs.filter(
    (j) => (!f.family || j.family === f.family) && (!f.mode || j.mode === f.mode),
  );
}

export function isStale(lastCheck: string, now: Date): boolean {
  return now.getTime() - new Date(lastCheck).getTime() > 4 * DAY;
}

export function badge(job: Job, lastCheck: string): string {
  const age = new Date(lastCheck).getTime() - new Date(job.firstSeen).getTime();
  if (age <= NEW_WINDOW) return "New";
  return `Since ${SHORT_DATE.format(new Date(job.firstSeen))}`;
}
