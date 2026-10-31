// Pure transform: labor-market-radar vacancies.csv rows -> public JobsData.
// Only whitelisted fields are copied, so private columns can never leak.

const FAMILIES = {
  design_engineering: "Design Engineer",
  product_building: "Product Builder",
  gtm_engineering: "GTM Engineer",
};
const MODES = new Set(["remote", "hybrid", "onsite"]);
const CURRENCY_SYMBOLS = { USD: "$", EUR: "€", GBP: "£" };
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CYRILLIC = /[Ѐ-ӿ]/;

const toMs = (value) => {
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
};
const iso = (ms) => new Date(ms).toISOString();

function formatSalary(row) {
  if (row.salary_period !== "year") return null;
  const min = parseFloat(row.salary_min);
  const max = parseFloat(row.salary_max);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  const currency = (row.salary_currency ?? "").trim().toUpperCase();
  const prefix = CURRENCY_SYMBOLS[currency] ?? (currency ? `${currency} ` : "");
  const lo = Math.floor(min / 1000);
  const hi = Math.floor(max / 1000);
  const range = lo === hi ? `${lo}` : `${lo}–${hi}`;
  return `${prefix}${range}k / yr`;
}

function formatLocation(raw) {
  const location = (raw ?? "").trim();
  if (CYRILLIC.test(location)) return "Multiple locations, Europe";
  const parts = location
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  return parts.length > 1 ? `${parts[0]} +${parts.length - 1}` : parts[0];
}

function formatSkills(raw) {
  return (raw ?? "")
    .split("|")
    .map((s) => s.trim().replaceAll("_", " "))
    .filter((s) => s && !CYRILLIC.test(s))
    .slice(0, 4);
}

const orNull = (value) => {
  const v = (value ?? "").trim();
  return v === "" || v === "unknown" ? null : v;
};

// Family labels alone are not a relevance review. Explicit responsibility-based
// exclusions win; reject backend/infra titles even if a later collection mislabels them.
export function isTargetRole(row) {
  if (/(?:^|[;|\s])target_selection=excluded(?:$|[;|\s])/.test(row.notes ?? "")) return false;
  return !/\b(?:dev\s*ops|back[ -]?end|site reliability|infrastructure engineer|platform engineer)\b/i.test(row.title_original ?? "");
}

export function transformRows(rows) {
  const eligible = rows.filter((r) => r.market === "world" && r.role_family in FAMILIES && isTargetRole(r));

  const exportedRaw = eligible.filter((r) => {
    if (r.status !== "active") return false;
    if (CYRILLIC.test(r.title_original) || CYRILLIC.test(r.company)) {
      console.warn(`Dropping ${r.vacancy_id}: Cyrillic title or company`);
      return false;
    }
    return true;
  });

  const exported = exportedRaw
    .map((r) => ({
      r,
      firstSeen: toMs(r.first_seen_at),
      lastChecked: toMs(r.last_checked_at),
    }))
    .filter(({ r, firstSeen, lastChecked }) => {
      if (firstSeen === null || lastChecked === null) {
        console.warn(`Dropping ${r.vacancy_id}: unparseable dates`);
        return false;
      }
      return true;
    });

  const lastCheckMs = exported.reduce((m, e) => Math.max(m, e.lastChecked), 0);
  const cutoff = lastCheckMs - WEEK_MS;

  const jobs = exported
    .sort((a, b) => b.firstSeen - a.firstSeen)
    .map(({ r, firstSeen, lastChecked }) => ({
      id: r.vacancy_id,
      title: r.title_original.trim(),
      company: r.company.trim(),
      family: FAMILIES[r.role_family],
      location: formatLocation(r.location),
      mode: MODES.has(r.work_mode) ? r.work_mode : null,
      seniority: orNull(r.seniority),
      salary: formatSalary(r),
      firstSeen: iso(firstSeen),
      lastChecked: iso(lastChecked),
      skills: formatSkills(r.required_skills),
      url: r.source_url,
    }));

  const newThisWeek = exported.filter((e) => e.firstSeen >= cutoff).length;
  const closedThisWeek = eligible.filter((r) => {
    if (r.status !== "closed") return false;
    const checked = toMs(r.last_checked_at);
    return checked !== null && checked >= cutoff;
  }).length;

  return {
    generatedFrom: "labor-market-radar",
    lastCheck: jobs.length ? iso(lastCheckMs) : "",
    stats: { open: jobs.length, newThisWeek, closedThisWeek },
    jobs,
  };
}
