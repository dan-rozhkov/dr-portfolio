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

// Regions come from the RAW location (every ";" part), because the displayed
// location collapses extras into "+N". A job can match several regions.
// Each part is classified country-first: an explicit country (or region name)
// decides alone; city/state keywords are only a fallback when none is named.
const wordRe = (words, flags = "iu") =>
  new RegExp(`(?<![\\p{L}\\d])(?:${words.join("|")})(?![\\p{L}\\d])`, flags);

const US_COUNTRY_RE = wordRe(["United States", "North America", "America's"]);
// Case-sensitive so the pronoun "us" never matches.
const US_ABBR_RE = /(?<![\p{L}\d.])(?:USA|US)(?![\p{L}\d])|(?<![\p{L}\d])U\.S\.(?:A\.)?/u;
const EUROPE_COUNTRIES = [
  "Europe", "European", "EMEA", "United Kingdom", "Great Britain", "England", "Scotland", "Wales",
  "Northern Ireland", "Ireland", "Germany", "Poland", "Portugal", "Spain", "France", "Netherlands",
  "Belgium", "Luxembourg", "Switzerland", "Austria", "Italy", "Sweden", "Norway", "Denmark",
  "Finland", "Estonia", "Latvia", "Lithuania", "Czech Republic", "Czechia", "Slovakia", "Hungary",
  "Romania", "Bulgaria", "Croatia", "Slovenia", "Serbia", "Greece", "Cyprus", "Malta", "Iceland",
  "Albania", "Bosnia", "Montenegro", "North Macedonia", "Moldova", "Ukraine", "Monaco",
];
const EUROPE_COUNTRY_RE = wordRe(EUROPE_COUNTRIES);
const EUROPE_ABBR_RE = /(?<![\p{L}\d.])(?:EU|UK)(?![\p{L}\d])/u;
// Countries and regions that are neither: naming one settles the part as "other".
const OTHER_COUNTRY_RE = wordRe([
  "Canada", "Australia", "New Zealand", "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru",
  "Latin America", "South America", "Central America", "Americas", "India", "Israel", "Singapore",
  "Japan", "China", "Korea", "Taiwan", "Hong Kong", "Thailand", "Vietnam", "Indonesia", "Philippines",
  "Pakistan", "Bangladesh", "Turkey", "Turkiye", "UAE", "United Arab Emirates", "Saudi Arabia",
  "Egypt", "Morocco", "Nigeria", "Kenya", "South Africa", "Armenia", "Kazakhstan", "Uzbekistan",
  "APAC", "LATAM",
]);
// Sub-national names that signal a non-US, non-Europe place when no country is given.
const OTHER_CONTEXT_RE = wordRe([
  "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia",
  "New Brunswick", "Newfoundland", "New South Wales", "Queensland", "Porto Alegre", "Rio Grande",
]);
const CANADA_CODE_RE = /,\s*(?:ON|BC|AB|QC|MB|SK|NS|NB|NL|PE)\b/;
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
  "Washington", "West Virginia", "Wisconsin", "Wyoming",
  // "Georgia" is left out on purpose: it is also a country.
];
const US_STATE_RE = wordRe(US_STATES);
// Only codes that are not also ISO country codes (IL, CO, MA, ...); CA is handled separately.
const US_CODE_RE = /,\s*(?:WA|NY|NJ|TX|DC|FL|OR|PA|VA|NC|AZ|OH|MI|MN|UT)\b/;
const US_CITY_RE = wordRe([
  "San Francisco", "Seattle", "Sunnyvale", "San Mateo", "Redwood City", "Austin", "Chicago", "Boston",
  "Los Angeles", "San Jose", "Palo Alto", "Mountain View", "Menlo Park", "Brooklyn", "Denver",
  "Atlanta", "Miami", "Portland", "San Diego", "Bay Area", "Silicon Valley",
]);
const EUROPE_CITY_RE = wordRe([
  "Dublin", "London", "Manchester", "Edinburgh", "Berlin", "Munich", "Cologne", "Hamburg", "Frankfurt",
  "Warsaw", "Krakow", "Lisbon", "Porto", "Madrid", "Barcelona", "Paris", "Amsterdam", "Brussels",
  "Zurich", "Geneva", "Vienna", "Rome", "Milan", "Stockholm", "Oslo", "Copenhagen", "Helsinki",
  "Tallinn", "Riga", "Vilnius", "Prague", "Bratislava", "Budapest", "Bucharest", "Sofia", "Zagreb",
  "Ljubljana", "Belgrade", "Athens", "Limassol", "Paphos", "Nicosia", "Kyiv",
]);

function classifyPart(raw) {
  const regions = new Set();
  // Strip sub-national names first so "New South Wales" never reads as Wales.
  const hasOtherContext = OTHER_CONTEXT_RE.test(raw) || CANADA_CODE_RE.test(raw);
  const part = raw.replace(OTHER_CONTEXT_RE, " ");
  const usCountry = US_COUNTRY_RE.test(part) || US_ABBR_RE.test(part);
  const euCountry = EUROPE_COUNTRY_RE.test(part) || EUROPE_ABBR_RE.test(part);
  if (usCountry) regions.add("us");
  if (euCountry) regions.add("europe");
  if (usCountry || euCountry || OTHER_COUNTRY_RE.test(part)) return regions;

  // No country named: Canadian/Australian/Brazilian sub-regions settle it as "other".
  if (hasOtherContext) return regions;
  if (US_STATE_RE.test(part) || US_CODE_RE.test(part) || /,\s*CA\b/.test(part)) {
    regions.add("us"); // "Paris, Texas" is a US place, not a European one.
    return regions;
  }
  if (US_CITY_RE.test(part)) regions.add("us");
  if (EUROPE_CITY_RE.test(part)) regions.add("europe");
  return regions;
}

export function classifyRegions(raw) {
  const regions = new Set();
  for (const part of (raw ?? "").split(";")) {
    if (CYRILLIC.test(part)) {
      regions.add("europe");
      classifyPart(part.replace(/[Ѐ-ӿ]+/g, " ")).forEach((r) => regions.add(r));
    } else {
      classifyPart(part).forEach((r) => regions.add(r));
    }
  }
  const ordered = ["us", "europe"].filter((r) => regions.has(r));
  return ordered.length ? ordered : ["other"];
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
  const title = row.title_original ?? "";
  if (/\b(?:dev\s*ops|back[ -]?end|site reliability|infrastructure engineer|platform engineer)\b/i.test(title)) return false;
  // Off-filter for Design Engineer / Product Builder / GTM Engineer, per Danil's review.
  return !/\b(?:forward[ -]deployed|growth engineer|full[ -]?stack software engineer)\b|\bcrm\b.*\bmanager\b/i.test(title);
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
      regions: classifyRegions(r.location),
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
