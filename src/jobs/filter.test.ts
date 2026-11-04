import { describe, expect, it } from "vitest";
import { filterJobs, isNew, isStale, sinceLabel } from "./filter";
import type { Job } from "./types";

const mk = (id: string, family: Job["family"], mode: Job["mode"], firstSeen = "2026-10-24T00:00:00Z"): Job => ({
  id, title: id, company: "C", family, location: "", mode, seniority: null,
  salary: null, firstSeen, lastChecked: firstSeen, skills: [], url: "https://x.test",
});

const jobs = [
  mk("a", "Design Engineer", "remote"),
  mk("b", "Design Engineer", "hybrid"),
  mk("c", "Product Builder", "remote"),
  mk("d", "GTM Engineer", null),
];

describe("filterJobs", () => {
  it("filters by family", () => {
    expect(filterJobs(jobs, { family: "Design Engineer", mode: null }).map((j) => j.id)).toEqual(["a", "b"]);
  });
  it("filters by mode", () => {
    expect(filterJobs(jobs, { family: null, mode: "remote" }).map((j) => j.id)).toEqual(["a", "c"]);
  });
  it("filters by both", () => {
    expect(filterJobs(jobs, { family: "Design Engineer", mode: "remote" }).map((j) => j.id)).toEqual(["a"]);
  });
  it("returns all when neither", () => {
    expect(filterJobs(jobs, { family: null, mode: null })).toHaveLength(4);
  });
});

describe("isStale", () => {
  it("is true after more than 4 days", () => {
    expect(isStale("2026-10-30T09:30:00Z", new Date("2026-11-03T10:00:00Z"))).toBe(true);
  });
  it("is false within 4 days", () => {
    expect(isStale("2026-10-30T09:30:00Z", new Date("2026-11-02T10:00:00Z"))).toBe(false);
  });
});

describe("isNew", () => {
  const last = "2026-10-30T09:30:00Z";
  it("is true inside the 7-day window", () => {
    expect(isNew(mk("x", "GTM Engineer", null, "2026-10-28T00:00:00Z"), last)).toBe(true);
  });
  it("is false for older roles", () => {
    expect(isNew(mk("x", "GTM Engineer", null, "2026-10-20T00:00:00Z"), last)).toBe(false);
  });
});

describe("sinceLabel", () => {
  it("shows the first-seen date", () => {
    expect(sinceLabel(mk("x", "GTM Engineer", null, "2026-10-20T00:00:00Z"))).toBe("Since 20 Oct");
  });
});
