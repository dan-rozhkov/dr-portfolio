import { useId } from "react";
import type { CSSProperties } from "react";
import logos from "../data/job-logos.json";
import { assetUrl } from "../lib/url";
import { isNew, MODE_LABEL, sinceLabel } from "./filter";
import type { Job } from "./types";

const LOGOS: Record<string, { src: string; ratio: number }> = logos;

// Each half of the strip must outrun a 2560px screen: about 10px per character at --text-lg.
const STRIP_CHARS = 200;
const SEPARATOR_CHARS = 4;
const SECONDS_PER_CHAR = 0.16;

const NEW_COPIES = [0, 1, 2, 3, 4, 5];

/** Every logo fills the same frame: wide ones reach its width, compact ones its height. */
function Logo({ company }: { company: string }) {
  const logo = LOGOS[company];
  // A company fresh from the radar has no logo file yet.
  if (!logo) return <span className="jobs-logo-name">{company}</span>;
  const style = { "--logo-ratio": logo.ratio, aspectRatio: logo.ratio } as CSSProperties;
  return <img className="jobs-logo" src={assetUrl(logo.src)} alt="" loading="lazy" style={style} />;
}

/** "NEW" repeated around a circle; each copy has its own start, so no browser has to stretch the text. */
function NewStamp() {
  const pathId = useId();
  return (
    <div className="jobs-stamp">
      <span className="visually-hidden">New</span>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <path id={pathId} d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        </defs>
        {NEW_COPIES.map((i) => (
          <text key={i}>
            <textPath href={`#${pathId}`} startOffset={`${(i * 100) / NEW_COPIES.length}%`}>
              NEW
            </textPath>
          </text>
        ))}
      </svg>
    </div>
  );
}

/** Two equal halves slide by exactly one half, so the loop has no seam. */
function TagStrip({ tags }: { tags: string[] }) {
  const groupChars = tags.reduce((sum, t) => sum + t.length + SEPARATOR_CHARS, 0);
  const repeats = Math.ceil(STRIP_CHARS / groupChars);
  const style = { "--strip-time": `${Math.round(repeats * groupChars * SECONDS_PER_CHAR)}s` } as CSSProperties;
  return (
    <div className="jobs-strip" style={style}>
      <div className="jobs-strip-track">
        {Array.from({ length: repeats * 2 }, (_, copy) => (
          <span className="jobs-strip-group" aria-hidden={copy > 0 || undefined} key={copy}>
            {tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function JobCard({ job, lastCheck }: { job: Job; lastCheck: string }) {
  const fresh = isNew(job, lastCheck);
  return (
    <article className="case-card jobs-card">
      <a href={job.url} target="_blank" rel="noopener noreferrer">
        <div className="writing-thumb jobs-thumb">
          <div className="jobs-logo-field">
            <Logo company={job.company} />
          </div>
          {fresh && <NewStamp />}
        </div>
        <div className="writing-meta">
          {fresh ? "" : `${sinceLabel(job)} · `}
          {job.family}
        </div>
        <h2 className="case-card-title">{job.title}</h2>
        <p>
          {[job.company, job.location, job.mode ? MODE_LABEL[job.mode] : "", job.salary]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {job.skills.length > 0 && <TagStrip tags={job.skills} />}
      </a>
    </article>
  );
}
