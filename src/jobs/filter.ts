import type { Job, JobFamily, JobRegion } from "./types";

const DAY = 24 * 60 * 60 * 1000;
// Same window as the "new this week" stat.
const NEW_WINDOW = 7 * DAY;

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export const MODE_LABEL: Record<NonNullable<Job["mode"]>, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export const REGION_LABEL: Record<JobRegion, string> = {
  us: "USA",
  europe: "Europe",
  other: "Others",
};

export function filterJobs(
  jobs: Job[],
  f: { family: JobFamily | null; mode: Job["mode"]; region: JobRegion | null },
): Job[] {
  return jobs.filter(
    (j) => (!f.family || j.family === f.family) && (!f.mode || j.mode === f.mode) &&
      (!f.region || j.regions.includes(f.region)),
  );
}

export function isStale(lastCheck: string, now: Date): boolean {
  return now.getTime() - new Date(lastCheck).getTime() > 4 * DAY;
}

export function isNew(job: Job, lastCheck: string): boolean {
  return new Date(lastCheck).getTime() - new Date(job.firstSeen).getTime() <= NEW_WINDOW;
}

export function sinceLabel(job: Job): string {
  return `Since ${SHORT_DATE.format(new Date(job.firstSeen))}`;
}
