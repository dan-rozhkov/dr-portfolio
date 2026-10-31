import { useEffect, useState } from "react";
import data from "../data/jobs.json";
import { badge, filterJobs, isStale } from "./filter";
import type { Job, JobFamily, JobsData } from "./types";

const { jobs, stats, lastCheck } = data as JobsData;

const FAMILIES: JobFamily[] = ["Design Engineer", "Product Builder", "GTM Engineer"];
const MODES: { value: NonNullable<Job["mode"]>; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];
const MODE_LABEL: Record<NonNullable<Job["mode"]>, string> = {
  remote: "remote",
  hybrid: "hybrid",
  onsite: "on-site",
};

const FAMILY_COUNT = Object.fromEntries(FAMILIES.map((f) => [f, jobs.filter((j) => j.family === f).length]));
const MODE_COUNT = Object.fromEntries(MODES.map((m) => [m.value, jobs.filter((j) => j.mode === m.value).length]));

const CHECK_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

export default function JobsPage() {
  const [family, setFamily] = useState<JobFamily | null>(null);
  const [mode, setMode] = useState<Job["mode"]>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- time-dependent; must not run during render (hydration)
    setStale(isStale(lastCheck, new Date()));
  }, []);

  const shown = filterJobs(jobs, { family, mode });

  return (
    <main className="jobs-page">
      <section className="grid-shell jobs">
        <aside className="jobs-side">
          <h1 className="jobs-title">Jobs radar</h1>
          <p>Design engineer and product builder roles worldwide, tracked by my own agent.</p>
          <div className="jobs-stats">
            <div><b>{stats.open}</b><span>open now</span></div>
            <div><b>{stats.newThisWeek}</b><span>new this week</span></div>
            <div><b>{stats.closedThisWeek}</b><span>closed this week</span></div>
          </div>
          <div className="jobs-label">Role</div>
          <ul className="jobs-filter">
            {FAMILIES.map((f) => (
              <li key={f}>
                <button type="button" aria-pressed={family === f} onClick={() => setFamily(family === f ? null : f)}>
                  {f}
                  <span>{FAMILY_COUNT[f]}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="jobs-label">Format</div>
          <ul className="jobs-filter">
            {MODES.map((m) => (
              <li key={m.value}>
                <button type="button" aria-pressed={mode === m.value} onClick={() => setMode(mode === m.value ? null : m.value)}>
                  {m.label}
                  <span>{MODE_COUNT[m.value]}</span>
                </button>
              </li>
            ))}
          </ul>
          <span className="jobs-muted">Last check {CHECK_FORMAT.format(new Date(lastCheck))} UTC</span>
          {stale && <p className="jobs-stale">Data may be out of date.</p>}
        </aside>
        <div className="jobs-list">
          {shown.length === 0 ? (
            <p className="jobs-empty">No roles match these filters.</p>
          ) : (
            shown.map((j) => (
              <a key={j.id} className="jobs-card" href={j.url} target="_blank" rel="noopener noreferrer">
                <div className="jobs-top">
                  <div>
                    <h2>{j.title}</h2>
                    <div className="jobs-muted">
                      {[j.company, j.location, j.mode ? MODE_LABEL[j.mode] : ""].filter(Boolean).join(" · ")}
                    </div>
                    {j.salary && <div className="jobs-salary">{j.salary}</div>}
                  </div>
                  <span className="jobs-badge">{badge(j, lastCheck)}</span>
                </div>
                {j.skills.length > 0 && (
                  <div className="jobs-chips">
                    {j.skills.map((s) => <span key={s}>{s}</span>)}
                  </div>
                )}
              </a>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
