import { describe, expect, it } from "vitest";
import { transformRows } from "./transform.mjs";

const base = {
  vacancy_id: "v1",
  market: "world",
  role_family: "design_engineering",
  status: "active",
  title_original: "Design Engineer",
  company: "Acme",
  location: "Berlin, Germany",
  work_mode: "remote",
  seniority: "senior",
  salary_min: "",
  salary_max: "",
  salary_currency: "",
  salary_period: "unknown",
  required_skills: "figma|react",
  source_url: "https://example.com/1",
  first_seen_at: "2026-10-28T10:00:00+03:00",
  last_checked_at: "2026-10-30T10:00:00Z",
  russian_roots: "confirmed",
  roots_basis: "secret",
  notes: "private",
};
const row = (over = {}) => ({ ...base, ...over });
const one = (over) => transformRows([row(over)]).jobs[0];

describe("transformRows", () => {
  it("excludes RU-market and adjacent rows", () => {
    const { jobs } = transformRows([
      row({ vacancy_id: "a" }),
      row({ vacancy_id: "b", market: "ru" }),
      row({ vacancy_id: "c", role_family: "adjacent" }),
    ]);
    expect(jobs.map((j) => j.id)).toEqual(["a"]);
  });

  it("exposes exactly the Job keys", () => {
    expect(Object.keys(one())).toEqual([
      "id",
      "title",
      "company",
      "family",
      "location",
      "mode",
      "seniority",
      "salary",
      "firstSeen",
      "lastChecked",
      "skills",
      "url",
    ]);
  });

  it("leaves no Cyrillic in output", () => {
    const result = transformRows([
      row({ location: "Нидерланды; Сербия", required_skills: "дизайн|figma" }),
    ]);
    expect(JSON.stringify(result)).not.toMatch(/[А-Яа-яЁё]/);
    expect(result.jobs[0].location).toBe("Multiple locations, Europe");
    expect(result.jobs[0].skills).toEqual(["figma"]);
  });

  it("drops rows with Cyrillic title or company", () => {
    const { jobs } = transformRows([
      row({ vacancy_id: "a", title_original: "Дизайнер" }),
      row({ vacancy_id: "b", company: "Яндекс" }),
      row({ vacancy_id: "c" }),
    ]);
    expect(jobs.map((j) => j.id)).toEqual(["c"]);
  });

  it("formats salary", () => {
    const s = (min, max, cur, period) =>
      one({
        salary_min: min,
        salary_max: max,
        salary_currency: cur,
        salary_period: period,
      }).salary;
    expect(s("175000", "200000", "USD", "year")).toBe("$175–200k / yr");
    expect(s("5500", "6000", "USD", "unknown")).toBeNull();
    expect(s("122000", "144000", "EUR", "year")).toBe("€122–144k / yr");
    expect(s("13000", "38999", "PLN", "year")).toBe("PLN 13–38k / yr");
    expect(s("100000", "", "USD", "year")).toBeNull();
  });

  it("shortens location lists", () => {
    expect(
      one({
        location: "Amsterdam, Netherlands; Berlin, Germany; Madrid, Spain",
      }).location,
    ).toBe("Amsterdam, Netherlands +2");
    expect(one({ location: " Remote " }).location).toBe("Remote");
  });

  it("maps unknown mode and seniority to null, limits skills", () => {
    const j = one({
      work_mode: "unknown",
      seniority: "unknown",
      required_skills: "a_b|c|d|e|f",
    });
    expect(j.mode).toBeNull();
    expect(j.seniority).toBeNull();
    expect(j.skills).toEqual(["a b", "c", "d", "e"]);
  });

  it("filters Cyrillic skills before limiting to four", () => {
    const j = one({ required_skills: "дизайн|figma|react|css|motion" });
    expect(j.skills).toEqual(["figma", "react", "css", "motion"]);
  });

  it("computes stats and normalises dates as instants", () => {
    const result = transformRows([
      row({
        vacancy_id: "new",
        first_seen_at: "2026-10-28",
        last_checked_at: "2026-10-30T00:00:00Z",
      }),
      row({
        vacancy_id: "old",
        first_seen_at: "2026-10-01",
        last_checked_at: "2026-10-29T23:00:00+03:00",
      }),
      row({
        vacancy_id: "closed",
        status: "closed",
        last_checked_at: "2026-10-29",
      }),
    ]);
    expect(result.stats).toEqual({
      open: 2,
      newThisWeek: 1,
      closedThisWeek: 1,
    });
    expect(result.lastCheck).toBe("2026-10-30T00:00:00.000Z");
    expect(result.jobs.map((j) => j.id)).toEqual(["new", "old"]);
    expect(result.jobs[1].lastChecked).toBe("2026-10-29T20:00:00.000Z");
  });
});
